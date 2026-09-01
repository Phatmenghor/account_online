package com.internal.feature.junior_account.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.internal.enumation.AccountOpeningRequestStatusEnum;
import com.internal.enumation.AmlStatusEnum;
import com.internal.feature.junior_account.dto.request.JuniorCustomerRequest;
import com.internal.feature.aml.dto.response.AmlStatusDto;
import com.internal.feature.aml.models.JuniorAmlStatus;
import com.internal.feature.aml.repository.JuniorAmlStatusRepository;
import com.internal.feature.junior_account.models.JuniorAccountFinal;
import com.internal.feature.junior_account.repository.JuniorAccountFinalRepository;
import com.internal.feature.junior_account.service.JuniorAccountService;
import com.internal.feature.open_account.dto.request.CustomerCreationResult;
import com.internal.feature.open_account.dto.request.OpenAccountContext;
import com.internal.feature.open_account.dto.response.OpenAccountResponseDto;
import com.internal.feature.open_account.service.BankingService;
import com.internal.feature.open_account.service.ComplianceService;
import com.internal.feature.open_account.service.ReportingService;
import com.internal.feature.customer_image.service.CustomerImageService;
import com.internal.feature.customer_image.service.JuniorCustomerImageService;
import com.internal.feature.telegram_alerts.service.MonitoringService;
import com.internal.shared.constant.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.internal.feature.junior_account.event.JuniorAccountOpenedEvent;
import com.internal.feature.junior_account.mapper.JuniorAccountMapper;
import com.internal.feature.junior_account.service.JuniorBankingService;
import com.internal.feature.junior_account.service.CustomerInfoService;
import com.internal.feature.master_data.repository.BranchRepository;
import com.internal.feature.sms_otp.service.PhoneCheckService;
import com.internal.shared.exception.openaccount.AccountExistsException;
import org.springframework.context.ApplicationEventPublisher;

@Service
@RequiredArgsConstructor
@Slf4j
public class JuniorAccountServiceImpl implements JuniorAccountService {

    private final JuniorBankingService juniorBankingService;
    private final PhoneCheckService phoneCheckService;
    private final ComplianceService complianceService;
    private final ReportingService reportingService;
    private final MonitoringService monitoringService;
    private final ApplicationEventPublisher eventPublisher;
    private final JuniorAccountFinalRepository juniorAccountFinalRepository;
    private final JuniorCustomerImageService juniorCustomerImageService;
    private final CustomerImageService customerImageService;
    private final JuniorAccountMapper juniorAccountMapper;
    private final BranchRepository branchRepository;
    private final JuniorAmlStatusRepository juniorAmlStatusRepository;
    private final ObjectMapper objectMapper;
    private final CustomerInfoService customerInfoService;

    @Override
    @Transactional
    public OpenAccountResponseDto processJuniorAccountOpening(JuniorCustomerRequest request) throws Exception {
        boolean hasNid = Boolean.TRUE.equals(request.getHasNid());
        String legalId = request.getLegalId();

        // If NO NID mode, use Parent Legal NID (guardianLegalId) as the legalId (do NOT use synthetic JNR- timestamp)
        if (!hasNid) {
            String parentNid = (request.getGuardianLegalId() != null && !request.getGuardianLegalId().isBlank())
                    ? request.getGuardianLegalId().trim()
                    : null;

            if (parentNid != null && !parentNid.isBlank()) {
                legalId = parentNid;
                request.setLegalId(legalId);
            }
        }

        // Junior account uses JUNIOR_SECTOR (6012) for T24 Customer Creation and JUNIOR_PRODUCT (SAVE.JUNIOR.SAVING) for Account Creation
        request.setSector(AppConstants.JUNIOR_SECTOR);
        if (request.getProductAccount() == null || request.getProductAccount().isBlank()) {
            request.setProductAccount(AppConstants.JUNIOR_PRODUCT);
        }

        String currentStep = "START";
        String submittedBy = "Customer";

        long start = System.currentTimeMillis();
        log.info("[JuniorAccountService] Processing Junior Account Opening started. hasNid={}, legalId={}, submittedBy={}",
                hasNid, legalId, submittedBy);

        OpenAccountContext context = new OpenAccountContext();
        context.setRequest(request);
        context.setSubmittedBy(submittedBy);

        try {
            log.info("[JuniorAccountService] Step 1/10: Testing connection. legalId={}", legalId);
            currentStep = AppConstants.TEST_CONNECTION;
            juniorBankingService.testConnection();

            Map<String, String> customerInfo = null;
            if (hasNid && legalId != null && !legalId.isBlank() && !legalId.startsWith("JNR-")) {
                var existingJuniorNid = juniorAccountFinalRepository.findTopByLegalIdOrderByCreatedAtDesc(legalId.trim());
                if (existingJuniorNid.isPresent() && "COMPLETED".equalsIgnoreCase(existingJuniorNid.get().getStatus())) {
                    String existingCif = existingJuniorNid.get().getCif();
                    log.warn("[JuniorAccountService] Junior Account creation rejected. Legal ID {} is registered in Junior Account DB (CIF={})",
                            legalId, existingCif);
                    throw new AccountExistsException(existingCif, "អត្តសញ្ញាណប័ណ្ណនេះមានគណនី Junior រួចហើយ។ សូមប្រើប្រាស់អត្តសញ្ញាណប័ណ្ណផ្សេងទៀត។");
                }
            }

            if (hasNid) {
                log.info("[JuniorAccountService] Step 2/10: Retrieving customer info. legalId={}", legalId);
                currentStep = AppConstants.GET_CUSTOMER_INFO;
                customerInfo = juniorBankingService.getCustomerInfo(legalId);
                context.setCustomerInfo(customerInfo);

                log.info("[JuniorAccountService] Step 3/10: Validating existing accounts. legalId={}", legalId);
                currentStep = AppConstants.VALIDATE_EXISTING_ACCOUNT;
                juniorBankingService.validateExistingAccounts(customerInfo);
            }

            if ((request.getGuardianCif() == null || request.getGuardianCif().isBlank()) && request.getGuardianPhone() != null && !request.getGuardianPhone().isBlank()) {
                try {
                    var guardianPhoneCheck = phoneCheckService.checkPhone(request.getGuardianPhone().trim());
                    if (guardianPhoneCheck != null && guardianPhoneCheck.getCif() != null) {
                        request.setGuardianCif(guardianPhoneCheck.getCif());
                    }
                } catch (Exception e) {
                    log.warn("[JuniorAccountService] Soft check for guardian CIF by phone failed: {}", e.getMessage());
                }
            }

            // Enrich Guardian Legal ID (Parent NID) and Guardian Address if not provided by request
            if (request.getGuardianCif() != null && !request.getGuardianCif().isBlank()) {
                try {
                    var parentInfo = customerInfoService.getCustomerByCif(request.getGuardianCif());
                    if (parentInfo != null) {
                        if (parentInfo.getLegalId() != null && !parentInfo.getLegalId().isBlank() && (request.getGuardianLegalId() == null || request.getGuardianLegalId().isBlank())) {
                            request.setGuardianLegalId(parentInfo.getLegalId());
                            log.info("[JuniorAccountService] Enriched request guardianLegalId with parent NID for CIF={}", request.getGuardianCif());
                        }
                        if (request.getGuardianAddress() == null || request.getGuardianAddress().isBlank() || "N/A".equalsIgnoreCase(request.getGuardianAddress()) || "NA".equalsIgnoreCase(request.getGuardianAddress())) {
                            java.util.List<String> gAddrParts = new java.util.ArrayList<>();
                            if (parentInfo.getVillage() != null && !parentInfo.getVillage().isBlank()) gAddrParts.add(parentInfo.getVillage());
                            if (parentInfo.getCommune() != null && !parentInfo.getCommune().isBlank()) gAddrParts.add(parentInfo.getCommune());
                            if (parentInfo.getDistrict() != null && !parentInfo.getDistrict().isBlank()) gAddrParts.add(parentInfo.getDistrict());
                            if (parentInfo.getProvince() != null && !parentInfo.getProvince().isBlank()) gAddrParts.add(parentInfo.getProvince());

                            if (!gAddrParts.isEmpty()) {
                                String formattedGAddr = String.join(" / ", gAddrParts);
                                request.setGuardianAddress(formattedGAddr);
                                log.info("[JuniorAccountService] Enriched request guardianAddress for CIF={}", request.getGuardianCif());
                            }
                        }

                        if (!hasNid || request.getCustomerCurrentProvince() == null || request.getCustomerCurrentProvince().isBlank()) {
                            if (parentInfo.getProvince() != null && !parentInfo.getProvince().isBlank()) {
                                request.setCustomerCurrentProvince(parentInfo.getProvince());
                            }
                            if (parentInfo.getDistrict() != null && !parentInfo.getDistrict().isBlank()) {
                                request.setCustomerCurrentDistrict(parentInfo.getDistrict());
                            }
                            if (parentInfo.getCommune() != null && !parentInfo.getCommune().isBlank()) {
                                request.setCustomerCurrentCommune(parentInfo.getCommune());
                            }
                            if (parentInfo.getVillage() != null && !parentInfo.getVillage().isBlank()) {
                                request.setCustomerCurrentVillage(parentInfo.getVillage());
                            }
                            if (request.getLegalAddress() == null || request.getLegalAddress().isBlank()) {
                                request.setLegalAddress(request.getGuardianAddress());
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("[JuniorAccountService] Failed to enrich guardian details from CIF={}: {}", request.getGuardianCif(), e.getMessage());
                }
            }

            String amlStatus = AmlStatusEnum.APPROVE.name();
            if (hasNid) {
                log.info("[JuniorAccountService] Step 4/10: Performing AML check for Junior account opening (WITH NID). legalId={}", legalId);
                currentStep = AppConstants.PROCESS_AML;
                AmlStatusDto amlProcessResult = complianceService.processAml(request);
                context.setAmlResult(amlProcessResult);
                amlStatus = amlProcessResult.getStatus().name();
                complianceService.sentMessageOnHighRisk(request, amlProcessResult);
            } else {
                log.info("[JuniorAccountService] Step 4/10: Bypassing AML check for Junior account opening (NO NID). legalId={}", legalId);
            }

            log.info("[JuniorAccountService] Step 5/10: Creating customer in Core Banking. legalId={}", legalId);
            currentStep = AppConstants.CREATE_CUSTOMER;
            CustomerCreationResult customerResult = juniorBankingService.createCustomerIfNeeded(request, customerInfo);
            context.setCif(customerResult.getCif());
            context.setMnemonic(customerResult.getMnemonic());

            log.info("[JuniorAccountService] Step 6/10: Creating USD account ($). legalId={}, cif={}", legalId, context.getCif());
            currentStep = AppConstants.CREATE_USD_ACCOUNT;
            context.setUsdAccount(juniorBankingService.createAccountIfNeeded(request, customerInfo,
                    context.getCif(), AppConstants.CURRENCY_USD));

            log.info("[JuniorAccountService] Step 7/10: Creating KHR account. legalId={}, cif={}", legalId, context.getCif());
            currentStep = AppConstants.CREATE_KHR_ACCOUNT;
            context.setKhrAccount(juniorBankingService.createAccountIfNeeded(request, customerInfo,
                    context.getCif(), AppConstants.CURRENCY_KHR));

            log.info("[JuniorAccountService] Step 8/10: Validating accounts created. legalId={}, cif={}", legalId, context.getCif());
            currentStep = AppConstants.VALIDATE_ACCOUNT_CREATION;
            juniorBankingService.validateAllRequiredAccountsCreated(context.getCif(),
                    context.getKhrAccount(), context.getUsdAccount(), context.getCustomerInfo());

            log.info("[JuniorAccountService] Step 9/10: Activating mobile banking. legalId={}, cif={}", legalId, context.getCif());
            currentStep = AppConstants.ACTIVATE_MOBILE_BANKING;
            context.setMbActivationCode(juniorBankingService.activateMobileBanking(request, context.getCif(),
                    context.getKhrAccount(), context.getUsdAccount()));

            log.info("[JuniorAccountService] Step 10/10: Publishing JuniorAccountOpenedEvent. legalId={}", legalId);
            currentStep = "SAVE_FINAL_JUNIOR_LOG";
            eventPublisher.publishEvent(new JuniorAccountOpenedEvent(this, request, context, amlStatus, hasNid));

            long duration = System.currentTimeMillis() - start;
            log.info("[JuniorAccountService] Junior Account opened successfully. legalId={}, cif={}, khrAccount={}, usdAccount={}, durationMs={}, hasNid={}",
                    legalId, context.getCif(), context.getKhrAccount(), context.getUsdAccount(), duration, hasNid);

            return OpenAccountResponseDto.builder()
                    .legalId(legalId)
                    .submittedBy(submittedBy)
                    .amlStatus(amlStatus)
                    .cif(context.getCif())
                    .mnemonic(context.getMnemonic())
                    .khrAccount(context.getKhrAccount())
                    .usdAccount(context.getUsdAccount())
                    .mbActivationCode(context.getMbActivationCode())
                    .status("SUCCESS")
                    .message(AppConstants.MSG_SUCCESS)
                    .build();

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            log.error("[JuniorAccountService] Junior Account opening failed. step={}, legalId={}, durationMs={}, error={}",
                    currentStep, legalId, duration, e.getMessage(), e);

            final String failureRemark = reportingService.buildFailureRemark(
                    currentStep, context.getCif(), context.getKhrAccount(),
                    context.getUsdAccount(), context.getAmlResult());
            reportingService.saveFailureLogs(request, e, currentStep, failureRemark, false);
            throw e;
        }
    }

    @Override
    public Mono<OpenAccountResponseDto> processJuniorAccountOpeningReactive(JuniorCustomerRequest request) {
        Map<String, String> contextMap = org.slf4j.MDC.getCopyOfContextMap();
        return Mono.fromCallable(() -> {
            if (contextMap != null) {
                org.slf4j.MDC.setContextMap(contextMap);
            }
            try {
                return processJuniorAccountOpening(request);
            } finally {
                org.slf4j.MDC.clear();
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @Override
    public Page<JuniorAccountFinal> getAllJuniorAccountFinals(Pageable pageable) {
        return juniorAccountFinalRepository.findAll(pageable);
    }

    private void saveJuniorAccountFinal(JuniorCustomerRequest request, OpenAccountContext context, String amlStatusStr, boolean hasNid) {
        try {
            JuniorAccountFinal juniorFinal = juniorAccountMapper.toJuniorAccountFinal(request, context, hasNid);

            juniorFinal.setLegalDateOfBirth(parseDate(request.getDateOfBirth()));
            juniorFinal.setLegalIssuedDate(parseDate(request.getLegalIssueDate()));
            juniorFinal.setLegalExpiredDate(parseDate(request.getLegalExpireDate()));

            if (juniorFinal.getNationality() == null) {
                juniorFinal.setNationality("KH");
            }

            try {
                if (amlStatusStr != null) {
                    juniorFinal.setAmlStatus(AmlStatusEnum.valueOf(amlStatusStr));
                } else {
                    juniorFinal.setAmlStatus(AmlStatusEnum.APPROVE);
                }
            } catch (Exception ignored) {
                juniorFinal.setAmlStatus(AmlStatusEnum.APPROVE);
            }

            try {
                juniorFinal.setRequestPayload(objectMapper.writeValueAsString(request));
            } catch (Exception ignored) {}

            juniorAccountFinalRepository.save(juniorFinal);
            log.info("Saved JuniorAccountFinal record successfully for Legal ID: {}", request.getLegalId());

            if (request.getNidImageName() != null && request.getNidImageName().startsWith("data:image")) {
                try {
                    String nidName = "nid_" + request.getLegalId() + ".jpg";
                    customerImageService.saveBase64File(request.getNidImageName(), nidName, "junior_nid");
                    request.setNidImageName(nidName);
                } catch (Exception e) {
                    log.warn("Could not save Junior NID image file to disk: {}", e.getMessage());
                }
            }

            String selfieData = (request.getSelfieImageBase64() != null && !request.getSelfieImageBase64().isBlank())
                    ? request.getSelfieImageBase64()
                    : (request.getSelfieImageName() != null && request.getSelfieImageName().startsWith("data:image") ? request.getSelfieImageName() : null);

            if (selfieData != null && !selfieData.isBlank()) {
                try {
                    String selfieName = "selfie_" + request.getLegalId() + ".jpg";
                    customerImageService.saveBase64File(selfieData, selfieName, "junior_selfie");
                    request.setSelfieImageName(selfieName);
                } catch (Exception e) {
                    log.warn("Could not save Junior selfie image file to disk: {}", e.getMessage());
                }
            }

            if (request.getReferenceDocImage() != null && !request.getReferenceDocImage().isBlank()) {
                try {
                    String docExt = ".pdf";
                    if (request.getReferenceDocName() != null && request.getReferenceDocName().contains(".")) {
                        docExt = request.getReferenceDocName().substring(request.getReferenceDocName().lastIndexOf('.')).toLowerCase();
                    } else if (request.getReferenceDocImage().startsWith("data:application/pdf")) {
                        docExt = ".pdf";
                    } else if (request.getReferenceDocImage().startsWith("data:image/png")) {
                        docExt = ".png";
                    } else if (request.getReferenceDocImage().startsWith("data:image/jpeg") || request.getReferenceDocImage().startsWith("data:image/jpg")) {
                        docExt = ".jpg";
                    } else if (request.getReferenceDocImage().startsWith("data:image/webp")) {
                        docExt = ".webp";
                    }

                    String docName = "ref_doc_" + request.getLegalId() + docExt;
                    customerImageService.saveBase64File(request.getReferenceDocImage(), docName, "junior/document");
                    request.setReferenceDocName(docName);
                    if (request.getNidImageName() == null || request.getNidImageName().isBlank() || request.getNidImageName().startsWith("data:image")) {
                        request.setNidImageName(docName);
                    }
                } catch (Exception e) {
                    log.warn("Could not save Junior reference document file to disk: {}", e.getMessage());
                }
            }

            if (request.getNidImageName() != null && !request.getNidImageName().isBlank()) {
                juniorCustomerImageService.saveImage("NID", request.getNidImageName(), request.getLegalId(), request.getGuardianLegalId());
            }
            if (request.getSelfieImageName() != null && !request.getSelfieImageName().isBlank()) {
                juniorCustomerImageService.saveImage("SELFIE", request.getSelfieImageName(), request.getLegalId(), request.getGuardianLegalId());
            }
            if (request.getReferenceDocName() != null && !request.getReferenceDocName().isBlank()) {
                juniorCustomerImageService.saveImage("REF_DOC", request.getReferenceDocName(), request.getLegalId(), request.getGuardianLegalId());
            }
        } catch (Exception e) {
            log.error("Failed to save JuniorAccountFinal record for Legal ID: {}. Error: {}", request.getLegalId(), e.getMessage(), e);
        }
    }

    private void saveJuniorAmlStatus(JuniorCustomerRequest request, Object amlResult, boolean hasNid) {
        try {
            Optional<JuniorAmlStatus> existingOpt = juniorAmlStatusRepository.findByLegalId(request.getLegalId());
            JuniorAmlStatus amlStatus = existingOpt.orElseGet(JuniorAmlStatus::new);

            juniorAccountMapper.updateJuniorAmlStatusFromRequest(request, hasNid, amlStatus);

            if (amlStatus.getLegalId() == null) amlStatus.setLegalId(request.getLegalId());
            if (amlStatus.getFamilyName() == null) amlStatus.setFamilyName(request.getFamilyName());
            if (amlStatus.getGivenName() == null) amlStatus.setGivenName(request.getGivenName());
            if (amlStatus.getFirstNameKh() == null) amlStatus.setFirstNameKh(request.getFirstNameKh());
            if (amlStatus.getLastNameKh() == null) amlStatus.setLastNameKh(request.getLastNameKh());
            if (amlStatus.getDateOfBirth() == null) amlStatus.setDateOfBirth(request.getDateOfBirth());
            if (amlStatus.getGender() == null) amlStatus.setGender(request.getGender());
            if (amlStatus.getPhoneNumber() == null) amlStatus.setPhoneNumber(request.getPhoneNumber());
            if (amlStatus.getMaritalStatus() == null) amlStatus.setMaritalStatus(request.getMaritalStatus());
            if (amlStatus.getNidImageName() == null) amlStatus.setNidImageName(request.getNidImageName());
            if (amlStatus.getSelfieImageName() == null) amlStatus.setSelfieImageName(request.getSelfieImageName());

            try {
                amlStatus.setRequestPayload(objectMapper.writeValueAsString(request));
            } catch (Exception ignored) {}

            juniorAmlStatusRepository.save(amlStatus);
            log.info("Saved JuniorAmlStatus record successfully for Legal ID: {}", request.getLegalId());
        } catch (Exception e) {
            log.error("Failed to save JuniorAmlStatus record: {}", e.getMessage());
        }
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        } catch (Exception e1) {
            try {
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            } catch (Exception e2) {
                return null;
            }
        }
    }
}
