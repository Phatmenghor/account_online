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
import com.internal.feature.customer_image.service.JuniorCustomerImageService;
import com.internal.feature.telegram_alerts.service.MonitoringService;
import com.internal.shared.constant.AppConstants;
import com.internal.shared.util.SecurityUtils;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class JuniorAccountServiceImpl implements JuniorAccountService {

    private final BankingService bankingService;
    private final ComplianceService complianceService;
    private final ReportingService reportingService;
    private final JuniorAccountFinalRepository juniorAccountFinalRepository;
    private final JuniorAmlStatusRepository juniorAmlStatusRepository;
    private final JuniorCustomerImageService juniorCustomerImageService;
    private final MonitoringService monitoringService;
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

        String currentStep = "START";
        String submittedBy = "Customer";
        try {
            String username = SecurityUtils.getCurrentUsername();
            if (username != null) {
                submittedBy = username;
            }
        } catch (Exception ignored) {}

        log.info("Processing Junior Account Opening | Has NID: {} | Legal ID: {} | Submitted by: {}",
                hasNid, legalId, submittedBy);

        OpenAccountContext context = OpenAccountContext.builder().request(request).submittedBy(submittedBy).build();

        try {
            log.info("Step 1: Testing connection | Legal ID: {}", legalId);
            currentStep = AppConstants.TEST_CONNECTION;
            bankingService.testConnection();

            Map<String, String> customerInfo = null;
            if (hasNid) {
                log.info("Step 2: Retrieving customer info | Legal ID: {}", legalId);
                currentStep = AppConstants.GET_CUSTOMER_INFO;
                customerInfo = bankingService.getCustomerInfo(legalId);
                context.setCustomerInfo(customerInfo);

                log.info("Step 3: Validating existing accounts | Legal ID: {}", legalId);
                currentStep = AppConstants.VALIDATE_EXISTING_ACCOUNT;
                bankingService.validateExistingAccounts(customerInfo);
            }

            log.info("Step 4: Processing Junior AML | Legal ID: {}", legalId);
            currentStep = AppConstants.PROCESS_AML;
            var amlResult = complianceService.processAml(request);
            context.setAmlResult(amlResult);
            String amlStatus = amlResult != null ? amlResult.getStatus().name() : "UNKNOWN";
            complianceService.sentMessageOnHighRisk(request, amlResult);

            // Also persist Junior AML record into acc_junior_aml_status table
            saveJuniorAmlStatus(request, amlResult, hasNid);

            log.info("Step 5: Creating customer in Core Banking | Legal ID: {}", legalId);
            currentStep = AppConstants.CREATE_CUSTOMER;
            CustomerCreationResult customerResult = bankingService.createCustomerIfNeeded(request, customerInfo);
            context.setCif(customerResult.getCif());
            context.setMnemonic(customerResult.getMnemonic());

            log.info("Step 6: Creating KHR account | CIF: {}", context.getCif());
            currentStep = AppConstants.CREATE_KHR_ACCOUNT;
            context.setKhrAccount(bankingService.createAccountIfNeeded(request, customerInfo,
                    context.getCif(), AppConstants.CURRENCY_KHR));

            log.info("Step 7: Creating USD account | CIF: {}", context.getCif());
            currentStep = AppConstants.CREATE_USD_ACCOUNT;
            context.setUsdAccount(bankingService.createAccountIfNeeded(request, customerInfo,
                    context.getCif(), AppConstants.CURRENCY_USD));

            log.info("Step 8: Validating accounts created | CIF: {}", context.getCif());
            currentStep = AppConstants.VALIDATE_ACCOUNT_CREATION;
            bankingService.validateAllRequiredAccountsCreated(context.getCif(),
                    context.getKhrAccount(), context.getUsdAccount(), context.getCustomerInfo());

            log.info("Step 9: Activating mobile banking | CIF: {}", context.getCif());
            currentStep = AppConstants.ACTIVATE_MOBILE_BANKING;
            context.setMbActivationCode(bankingService.activateMobileBanking(request, context.getCif(),
                    context.getKhrAccount(), context.getUsdAccount()));

            log.info("Step 10: Saving Junior Account Final record into acc_junior_open_final | Legal ID: {}", legalId);
            currentStep = "SAVE_FINAL_JUNIOR_LOG";
            saveJuniorAccountFinal(request, context, amlStatus, hasNid);

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
                    currentStep, legalId, e.getMessage(), e);

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
            LocalDate dob = parseDate(request.getDateOfBirth());
            LocalDate issueDate = parseDate(request.getLegalIssueDate());
            LocalDate expireDate = parseDate(request.getLegalExpireDate());

            AmlStatusEnum amlStatusEnum = AmlStatusEnum.APPROVE;
            try {
                if (amlStatusStr != null) {
                    amlStatusEnum = AmlStatusEnum.valueOf(amlStatusStr);
                }
            } catch (Exception ignored) {}

            String payloadJson = null;
            try {
                payloadJson = objectMapper.writeValueAsString(request);
            } catch (Exception ignored) {}

            JuniorAccountFinal juniorFinal = JuniorAccountFinal.builder()
                    .cif(context.getCif())
                    .khrAccount(context.getKhrAccount())
                    .usdAccount(context.getUsdAccount())
                    .mnemonic(context.getMnemonic())
                    .hasNid(hasNid)
                    .legalId(request.getLegalId())
                    .legalDocName("NATIONAL.ID")
                    .legalFirstNameEn(request.getGivenName())
                    .legalLastNameEn(request.getFamilyName())
                    .legalFirstNameKh(request.getFirstNameKh())
                    .legalLastNameKh(request.getLastNameKh())
                    .legalDateOfBirth(dob)
                    .legalGender(request.getGender())
                    .legalAddress(request.getLegalAddress())
                    .legalIssuedDate(issueDate)
                    .legalExpiredDate(expireDate)
                    .guardianLegalId(request.getGuardianLegalId())
                    .guardianName(request.getGuardianName())
                    .guardianPhone(request.getGuardianPhone())
                    .guardianRelationship(request.getGuardianRelationship())
                    .maritalStatus(request.getMaritalStatus())
                    .nationality(request.getNationality() != null ? request.getNationality() : "KH")
                    .occupation(request.getOccupation())
                    .branchCode(request.getBranchCode())
                    .phoneNumber(request.getPhoneNumber())
                    .amlStatus(amlStatusEnum)
                    .status("COMPLETED")
                    .nidImageName(request.getNidImageName())
                    .selfieImageName(request.getSelfieImageName())
                    .requestPayload(payloadJson)
                    .build();

            juniorAccountFinalRepository.save(juniorFinal);
            log.info("Saved JuniorAccountFinal record successfully for Legal ID: {}", request.getLegalId());

            // Save image references into dedicated junior_customer_images table via JuniorCustomerImageService
            juniorCustomerImageService.saveImage("NID", request.getNidImageName(), request.getLegalId(), request.getGuardianLegalId());
            juniorCustomerImageService.saveImage("SELFIE", request.getSelfieImageName(), request.getLegalId(), request.getGuardianLegalId());
        } catch (Exception e) {
            log.error("Failed to save JuniorAccountFinal record for Legal ID: {}. Error: {}", request.getLegalId(), e.getMessage(), e);
        }
    }

    private void saveJuniorAmlStatus(JuniorCustomerRequest request, Object amlResult, boolean hasNid) {
        try {
            Optional<JuniorAmlStatus> existingOpt = juniorAmlStatusRepository.findByLegalId(request.getLegalId());
            JuniorAmlStatus amlStatus = existingOpt.orElseGet(JuniorAmlStatus::new);

            amlStatus.setLegalId(request.getLegalId());
            amlStatus.setHasNid(hasNid);
            amlStatus.setFamilyName(request.getFamilyName());
            amlStatus.setGivenName(request.getGivenName());
            amlStatus.setFirstNameKh(request.getFirstNameKh());
            amlStatus.setLastNameKh(request.getLastNameKh());
            amlStatus.setDateOfBirth(request.getDateOfBirth());
            amlStatus.setGender(request.getGender());
            amlStatus.setPhoneNumber(request.getPhoneNumber());
            amlStatus.setBranch(request.getBranchCode());
            amlStatus.setMaritalStatus(request.getMaritalStatus());
            amlStatus.setGuardianLegalId(request.getGuardianLegalId());
            amlStatus.setGuardianName(request.getGuardianName());
            amlStatus.setGuardianPhone(request.getGuardianPhone());
            amlStatus.setGuardianRelationship(request.getGuardianRelationship());
            amlStatus.setIssuedDate(request.getLegalIssueDate());
            amlStatus.setExpiredDate(request.getLegalExpireDate());
            amlStatus.setOccupationCode(request.getOccupation());
            amlStatus.setNidImageName(request.getNidImageName());
            amlStatus.setSelfieImageName(request.getSelfieImageName());
            amlStatus.setStatus(AmlStatusEnum.APPROVE.name());

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
