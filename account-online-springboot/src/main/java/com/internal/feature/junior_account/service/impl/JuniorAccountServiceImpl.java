package com.internal.feature.junior_account.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.internal.enumation.AccountOpeningRequestStatusEnum;
import com.internal.enumation.AmlStatusEnum;
import com.internal.feature.junior_account.dto.request.JuniorCustomerRequest;
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
    private final JuniorAccountFinalRepository juniorAccountFinalRepository;
    private final JuniorAmlStatusRepository juniorAmlStatusRepository;
    private final JuniorCustomerImageService juniorCustomerImageService;
    private final CustomerImageService customerImageService;
    private final JuniorAccountMapper juniorAccountMapper;
    private final MonitoringService monitoringService;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public OpenAccountResponseDto processJuniorAccountOpening(JuniorCustomerRequest request) throws Exception {
        boolean hasNid = Boolean.TRUE.equals(request.getHasNid());
        String legalId = request.getLegalId();

        // If NO NID mode and legalId is missing, generate a unique Junior ID
        if (!hasNid && (legalId == null || legalId.isBlank())) {
            legalId = "JNR-" + System.currentTimeMillis();
            request.setLegalId(legalId);
        }

        // Junior account uses JUNIOR_SECTOR (6012) for T24 Customer Creation and JUNIOR_PRODUCT (SAVE.JUNIOR.SAVING) for Account Creation
        request.setSector(AppConstants.JUNIOR_SECTOR);
        request.setProductAccount(AppConstants.JUNIOR_PRODUCT);

        String currentStep = "START";
        String submittedBy = "Customer";

        log.info("Processing Junior Account Opening | Has NID: {} | Legal ID: {} | Submitted by: {}",
                hasNid, legalId, submittedBy);

        OpenAccountContext context = OpenAccountContext.builder().request(request).submittedBy(submittedBy).build();

        try {
            log.info("Step 1: Testing connection | Legal ID: {}", legalId);
            currentStep = AppConstants.TEST_CONNECTION;
            juniorBankingService.testConnection();

            Map<String, String> customerInfo = null;
            if (hasNid) {
                log.info("Step 2: Retrieving customer info | Legal ID: {}", legalId);
                currentStep = AppConstants.GET_CUSTOMER_INFO;
                customerInfo = juniorBankingService.getCustomerInfo(legalId);
                context.setCustomerInfo(customerInfo);

                log.info("Step 3: Validating existing accounts | Legal ID: {}", legalId);
                currentStep = AppConstants.VALIDATE_EXISTING_ACCOUNT;
                juniorBankingService.validateExistingAccounts(customerInfo);
            }

            // Step 3.1: Validate that Junior phone number is NOT already registered in MB/CBS
            if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
                log.info("Step 3.1: Checking if Junior phone number is registered | Phone: {}", request.getPhoneNumber());
                currentStep = AppConstants.VALIDATE_EXISTING_ACCOUNT;
                var phoneCheckResult = phoneCheckService.checkPhone(request.getPhoneNumber().trim());
                if (phoneCheckResult != null && Boolean.TRUE.equals(phoneCheckResult.getHasAccount())) {
                    log.warn("Junior Account creation REJECTED: Phone number {} is ALREADY registered with CIF {}",
                            request.getPhoneNumber(), phoneCheckResult.getCif());
                    throw new AccountExistsException(phoneCheckResult.getCif());
                }
            }

            String amlStatus = AmlStatusEnum.APPROVE.name();
            log.info("Step 4: Bypassing AML check for Junior account opening | Legal ID: {}", legalId);

            log.info("Step 5: Creating customer in Core Banking | Legal ID: {}", legalId);
            currentStep = AppConstants.CREATE_CUSTOMER;
            CustomerCreationResult customerResult = juniorBankingService.createCustomerIfNeeded(request, customerInfo);
            context.setCif(customerResult.getCif());
            context.setMnemonic(customerResult.getMnemonic());

            log.info("Step 6: Creating KHR account | CIF: {}", context.getCif());
            currentStep = AppConstants.CREATE_KHR_ACCOUNT;
            context.setKhrAccount(juniorBankingService.createAccountIfNeeded(request, customerInfo,
                    context.getCif(), AppConstants.CURRENCY_KHR));

            log.info("Step 7: Creating USD account | CIF: {}", context.getCif());
            currentStep = AppConstants.CREATE_USD_ACCOUNT;
            context.setUsdAccount(juniorBankingService.createAccountIfNeeded(request, customerInfo,
                    context.getCif(), AppConstants.CURRENCY_USD));

            log.info("Step 8: Validating accounts created | CIF: {}", context.getCif());
            currentStep = AppConstants.VALIDATE_ACCOUNT_CREATION;
            juniorBankingService.validateAllRequiredAccountsCreated(context.getCif(),
                    context.getKhrAccount(), context.getUsdAccount(), context.getCustomerInfo());

            log.info("Step 9: Activating mobile banking | CIF: {}", context.getCif());
            currentStep = AppConstants.ACTIVATE_MOBILE_BANKING;
            context.setMbActivationCode(juniorBankingService.activateMobileBanking(request, context.getCif(),
                    context.getKhrAccount(), context.getUsdAccount()));

            log.info("Step 10: Publishing JuniorAccountOpenedEvent & Telegram alert | Legal ID: {}", legalId);
            currentStep = "SAVE_FINAL_JUNIOR_LOG";
            eventPublisher.publishEvent(new JuniorAccountOpenedEvent(this, request, context, amlStatus, hasNid));

            log.info("Junior Account opened successfully | CIF: {} | KHR: {} | USD: {} | Has NID: {}",
                    context.getCif(), context.getKhrAccount(), context.getUsdAccount(), hasNid);

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
            log.error("Junior Account opening failed at step: {} | Legal ID: {} | Error: {}",
                    currentStep, legalId, e.getMessage());

            final String failureRemark = reportingService.buildFailureRemark(
                    currentStep, context.getCif(), context.getKhrAccount(),
                    context.getUsdAccount(), context.getAmlResult());
            reportingService.saveFailureLogs(request, e, currentStep, failureRemark, false);
            throw e;
        }
    }

    @Override
    public Mono<OpenAccountResponseDto> processJuniorAccountOpeningReactive(JuniorCustomerRequest request) {
        String legalId = request.getLegalId();
        return Mono.fromCallable(() -> processJuniorAccountOpening(request))
                .subscribeOn(Schedulers.boundedElastic());
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
                    String docName = "ref_doc_" + request.getLegalId() + ".png";
                    customerImageService.saveBase64File(request.getReferenceDocImage(), docName, "junior_document");
                    request.setReferenceDocName(docName);
                    if (request.getNidImageName() == null || request.getNidImageName().isBlank() || request.getNidImageName().startsWith("data:image")) {
                        request.setNidImageName(docName);
                    }
                } catch (Exception e) {
                    log.warn("Could not save Junior reference document image file to disk: {}", e.getMessage());
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
