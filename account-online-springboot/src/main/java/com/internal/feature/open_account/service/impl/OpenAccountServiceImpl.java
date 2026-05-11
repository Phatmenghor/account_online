package com.internal.feature.open_account.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.internal.enumation.AccountOpeningRequestStatusEnum;
import com.internal.enumation.AmlStatusEnum;
import com.internal.exceptions.error.custom.NotFoundException;
import com.internal.exceptions.error.openaccount.OpenAccountException;
import com.internal.feature.open_account.dto.OpenAccountContext;
import com.internal.feature.open_account.dto.request.ApproveAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.request.CustomerCreationResult;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.request.RejectAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.response.CustomerResponse;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.request.AllPendingAccountHistoryRequestDto;
import com.internal.feature.open_account.dto.response.AllPendingAccountOpeningHistoryResponseDto;
import com.internal.feature.open_account.dto.response.PendingAccountAdminReviewDto;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningHistoryDto;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestHistoryDto;
import com.internal.feature.open_account.event.AccountOpenedEvent;
import com.internal.feature.open_account.facade.BankingService;
import com.internal.feature.open_account.facade.ComplianceService;
import com.internal.feature.open_account.facade.ReportingService;
import com.internal.feature.open_account.models.PendingAccountOpeningRequest;
import com.internal.feature.open_account.models.PendingAccountOpeningRequestHistory;
import com.internal.feature.open_account.repository.PendingAccountOpeningRequestRepository;
import com.internal.feature.open_account.repository.PendingAccountOpeningRequestHistoryRepository;
import com.internal.feature.open_account.service.OpenAccountService;
import com.internal.feature.telegram_alerts.service.MonitoringService;
import com.internal.utils.SecurityUtils;
import com.internal.utils.constants.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.internal.utils.pagination.PaginationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAccountServiceImpl implements OpenAccountService {

    private final BankingService bankingService;
    private final ComplianceService complianceService;
    private final ReportingService reportingService;
    private final ApplicationEventPublisher eventPublisher;
    private final MonitoringService monitoringService;
    private final PendingAccountOpeningRequestRepository pendingRequestRepository;
    private final PendingAccountOpeningRequestHistoryRepository historyRepository;
    private final SecurityUtils securityUtils;
    private final ObjectMapper objectMapper;

    @Transactional
    public CustomerResponse openAccount(CustomerRequest request) throws Exception {
        String legalId = request.getLegalId();
        log.info("Opening account | Legal ID: {}", legalId);

        OpenAccountContext context = OpenAccountContext.builder().request(request).build();
        String currentStep = "START";

        try {
            // Step 1: Test connection
            log.debug("Step 1: Testing connection");
            currentStep = AppConstants.TEST_CONNECTION;
            bankingService.testConnection();
            monitoringService.logAccountOpeningStepProgress(legalId, "TEST_CONNECTION", true, null);

            // Step 2: Check existing complete account
            log.debug("Step 2: Checking existing account");
            currentStep = "CHECK_EXISTING_COMPLETE_ACCOUNT";
            var recoveryResult = bankingService.checkExistingCompleteAccountAndActivate(request);
            if (recoveryResult.isPresent()) {
                var existingAccount = bankingService.getExistingAccountDetails(legalId);
                if (existingAccount.isPresent()) {
                    log.info("✓ Account already exists (recovered) | CIF: {} | Mnemonic: {}",
                            existingAccount.get().getCif(), existingAccount.get().getMnemonic());
                    return complianceService.buildCustomerAccInfo(
                            existingAccount.get().getCif(),
                            existingAccount.get().getKhrAccount(),
                            existingAccount.get().getUsdAccount(),
                            existingAccount.get().getMnemonic());
                }
            }

            // Step 3: Get customer info
            log.debug("Step 3: Retrieving customer info");
            currentStep = AppConstants.GET_CUSTOMER_INFO;
            Map<String, String> customerInfo = bankingService.getCustomerInfo(legalId);
            String customerCif = customerInfo != null ? customerInfo.get("CIF") : "N/A";
            monitoringService.logAccountOpeningStepProgress(legalId, "GET_CUSTOMER_INFO", true, customerCif);

            // Step 4: Validate existing accounts
            log.debug("Step 4: Validating accounts");
            currentStep = AppConstants.VALIDATE_EXISTING_ACCOUNT;
            bankingService.validateExistingAccounts(customerInfo);
            monitoringService.logAccountOpeningStepProgress(legalId, "VALIDATE_EXISTING_ACCOUNT", true, null);

            // Step 5: Process AML
            log.debug("Step 5: Processing AML");
            currentStep = AppConstants.PROCESS_AML;
            var amlResult = complianceService.processAml(request);
            String amlStatus = amlResult != null ? amlResult.getStatus().name() : "UNKNOWN";
            monitoringService.logAccountOpeningStepProgress(legalId, "PROCESS_AML", true, amlStatus);
            complianceService.sentMessageOnHighRisk(request, amlResult);

            // Step 6: Create customer
            log.debug("Step 6: Creating customer");
            currentStep = AppConstants.CREATE_CUSTOMER;
            CustomerCreationResult customerResult = bankingService.createCustomerIfNeeded(request, customerInfo);
            context.setCif(customerResult.getCif());
            context.setMnemonic(customerResult.getMnemonic());
            monitoringService.logAccountOpeningStepProgress(legalId, "CREATE_CUSTOMER", true, customerResult.getCif());

            // Step 7: Create KHR Account
            log.debug("Step 7: Creating KHR account");
            currentStep = AppConstants.CREATE_KHR_ACCOUNT;
            context.setKhrAccount(bankingService.createAccountIfNeeded(request, customerInfo,
                    context.getCif(), AppConstants.CURRENCY_KHR));
            monitoringService.logAccountOpeningStepProgress(legalId, "CREATE_KHR_ACCOUNT", true, context.getKhrAccount());

            // Step 8: Create USD Account
            log.debug("Step 8: Creating USD account");
            currentStep = AppConstants.CREATE_USD_ACCOUNT;
            context.setUsdAccount(bankingService.createAccountIfNeeded(request, customerInfo,
                    context.getCif(), AppConstants.CURRENCY_USD));
            monitoringService.logAccountOpeningStepProgress(legalId, "CREATE_USD_ACCOUNT", true, context.getUsdAccount());

            // Step 9: Final Validation
            log.debug("Step 9: Validating accounts");
            currentStep = AppConstants.VALIDATE_ACCOUNT_CREATION;
            bankingService.validateAllRequiredAccountsCreated(context.getCif(),
                    context.getKhrAccount(),
                    context.getUsdAccount());
            monitoringService.logAccountOpeningStepProgress(legalId, "VALIDATE_ACCOUNT_CREATION", true, null);

            // Step 10: Activate mobile banking
            log.debug("Step 10: Activating mobile banking");
            currentStep = AppConstants.ACTIVATE_MOBILE_BANKING;
            context.setMbActivationCode(bankingService.activateMobileBanking(request, context.getCif(),
                    context.getKhrAccount(), context.getUsdAccount()));
            monitoringService.logAccountOpeningStepProgress(legalId, "ACTIVATE_MOBILE_BANKING", true, null);

            CustomerResponse accInfo = complianceService.buildCustomerAccInfo(
                    context.getCif(), context.getKhrAccount(), context.getUsdAccount(),
                    context.getMnemonic());

            eventPublisher.publishEvent(new AccountOpenedEvent(this, context));

            log.info("✓ Account created successfully | CIF: {} | Mnemonic: {} | KHR: {} | USD: {}",
                    context.getCif(), context.getMnemonic(), context.getKhrAccount(), context.getUsdAccount());

            return accInfo;

        } catch (Exception e) {
            log.error("Account opening failed at step: {} | Legal ID: {}", currentStep, legalId, e);
            monitoringService.logAccountOpeningFailed(legalId, currentStep, e.getMessage(), e);
            final String failureRemark = reportingService.buildFailureRemark(
                    currentStep, context.getCif(), context.getKhrAccount(),
                    context.getUsdAccount(), context.getAmlResult());
            reportingService.saveFailureLogs(request, e, currentStep, failureRemark, false);
            throw e;
        }
    }

    @Override
    @Transactional
    public PendingAccountOpeningRequestDto submitAccountOpeningRequest(CustomerRequest request) throws Exception {
        String legalId = request.getLegalId();
        log.info("Submitting request for admin approval | Legal ID: {}", legalId);

        var existingPending = pendingRequestRepository.findByLegalIdAndStatus(
                legalId, AccountOpeningRequestStatusEnum.PENDING);
        if (existingPending.isPresent()) {
            throw new OpenAccountException("PENDING_REQUEST_EXISTS",
                    "Request already pending for legal ID: " + legalId);
        }

        try {
            // Step 1: Test connection
            log.debug("Step 1: Testing connection");
            bankingService.testConnection();
            monitoringService.logAccountOpeningStepProgress(legalId, "TEST_CONNECTION", true, null);

            // Step 2: Check existing account
            log.debug("Step 2: Checking existing account");
            var recoveryResult = bankingService.checkExistingCompleteAccountAndActivate(request);
            if (recoveryResult.isPresent()) {
                throw new OpenAccountException("ACCOUNT_ALREADY_EXISTS",
                        "Account already exists for legal ID: " + legalId);
            }

            // Step 3: Get customer info
            log.debug("Step 3: Retrieving customer info");
            Map<String, String> customerInfo = bankingService.getCustomerInfo(legalId);
            String customerCif = customerInfo != null ? customerInfo.get("CIF") : "N/A";
            log.debug("Customer CIF: {}", customerCif);
            monitoringService.logAccountOpeningStepProgress(legalId, "GET_CUSTOMER_INFO", true, customerCif);

            // Step 4: Validate existing accounts
            log.debug("Step 4: Validating accounts");
            bankingService.validateExistingAccounts(customerInfo);
            monitoringService.logAccountOpeningStepProgress(legalId, "VALIDATE_EXISTING_ACCOUNT", true, null);

            // Step 5: Process AML
            log.debug("Step 5: Processing AML");
            var amlResult = complianceService.processAml(request);
            String amlStatus = amlResult != null ? amlResult.getStatus().name() : "UNKNOWN";
            log.debug("AML status: {}", amlStatus);
            monitoringService.logAccountOpeningStepProgress(legalId, "PROCESS_AML", true, amlStatus);
            complianceService.sentMessageOnHighRisk(request, amlResult);

            // Store pending request for admin review
            log.debug("Storing request for admin review");
            PendingAccountOpeningRequest pendingRequest = PendingAccountOpeningRequest.builder()
                    .legalId(legalId)
                    .status(AccountOpeningRequestStatusEnum.PENDING)
                    .requestData(objectMapper.writeValueAsString(request))
                    .customerInfo(objectMapper.writeValueAsString(customerInfo))
                    .amlResultData(objectMapper.writeValueAsString(amlResult))
                    .amlStatus(amlResult != null ? amlResult.getStatus() : null)
                    .build();

            PendingAccountOpeningRequest saved = pendingRequestRepository.save(pendingRequest);
            log.info("✓ Request stored for admin approval | ID: {} | Legal ID: {} | AML: {}",
                    saved.getId(), legalId, amlStatus);

            return mapToDto(saved);

        } catch (OpenAccountException e) {
            log.warn("Request submission rejected | Legal ID: {} | Reason: {}", legalId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Request submission error | Legal ID: {}", legalId, e);
            monitoringService.logAccountOpeningFailed(legalId, "SUBMISSION", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public PendingAccountOpeningRequestDto approveAccountOpeningRequest(ApproveAccountOpeningRequestDto dto)
            throws Exception {
        Long requestId = dto.getRequestId();
        log.info("Approving request | ID: {}", requestId);

        PendingAccountOpeningRequest pendingRequest = pendingRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found: " + requestId));

        if (pendingRequest.getStatus() != AccountOpeningRequestStatusEnum.PENDING) {
            throw new OpenAccountException("INVALID_STATUS",
                    "Only PENDING requests can be approved");
        }

        // Extract customer data from stored JSON
        CustomerRequest customerRequest = null;
        try {
            if (pendingRequest.getRequestData() != null) {
                customerRequest = objectMapper.readValue(pendingRequest.getRequestData(), CustomerRequest.class);
            }
        } catch (Exception e) {
            log.error("Failed to parse customer data for request: {}", requestId, e);
            throw new OpenAccountException("INVALID_REQUEST_DATA", "Failed to parse customer data");
        }

        // Create the actual account with stored customer data
        log.info("Creating account for approved request | Legal ID: {}", pendingRequest.getLegalId());
        try {
            CustomerResponse accountResponse = openAccount(customerRequest);
            log.info("✓ Account created successfully for approved request | CIF: {}", accountResponse.getCif());
        } catch (Exception e) {
            log.error("Failed to create account for approved request: {}", requestId, e);
            throw new OpenAccountException("ACCOUNT_CREATION_FAILED", "Failed to create account: " + e.getMessage());
        }

        // Mark as approved in pending request
        pendingRequest.setStatus(AccountOpeningRequestStatusEnum.APPROVED);
        pendingRequest.setRemark(dto.getRemark());

        PendingAccountOpeningRequest saved = pendingRequestRepository.save(pendingRequest);

        saveHistory(saved, AccountOpeningRequestStatusEnum.APPROVED, dto.getRemark());

        log.info("✓ Request approved and account created | ID: {} | Legal ID: {}", saved.getId(), saved.getLegalId());

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public PendingAccountOpeningRequestDto rejectAccountOpeningRequest(RejectAccountOpeningRequestDto dto)
            throws Exception {
        Long requestId = dto.getRequestId();
        log.info("Rejecting request | ID: {}", requestId);

        PendingAccountOpeningRequest pendingRequest = pendingRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found: " + requestId));

        if (pendingRequest.getStatus() != AccountOpeningRequestStatusEnum.PENDING) {
            throw new OpenAccountException("INVALID_STATUS",
                    "Only PENDING requests can be rejected");
        }

        pendingRequest.setStatus(AccountOpeningRequestStatusEnum.REJECTED);
        pendingRequest.setRemark(dto.getRemark());

        PendingAccountOpeningRequest saved = pendingRequestRepository.save(pendingRequest);

        saveHistory(saved, AccountOpeningRequestStatusEnum.REJECTED, dto.getRemark());

        log.info("✓ Request rejected | ID: {} | Legal ID: {} | Remark: {}",
                saved.getId(), saved.getLegalId(), dto.getRemark());

        return mapToDto(saved);
    }

    private PendingAccountOpeningRequestDto mapToDto(PendingAccountOpeningRequest entity) {
        Long createdAtMillis = null;
        if (entity.getCreatedAt() != null) {
            createdAtMillis = entity.getCreatedAt()
                    .atZone(ZoneId.systemDefault())
                    .toInstant()
                    .toEpochMilli();
        }

        return PendingAccountOpeningRequestDto.builder()
                .id(entity.getId())
                .legalId(entity.getLegalId())
                .status(entity.getStatus())
                .amlStatus(entity.getAmlStatus())
                .remark(entity.getRemark())
                .createdAt(createdAtMillis)
                .build();
    }

    private PendingAccountOpeningRequestHistoryDto mapHistoryToDto(PendingAccountOpeningRequestHistory entity) {
        Long createdAtMillis = null;
        if (entity.getCreatedAt() != null) {
            createdAtMillis = entity.getCreatedAt()
                    .atZone(ZoneId.systemDefault())
                    .toInstant()
                    .toEpochMilli();
        }

        return PendingAccountOpeningRequestHistoryDto.builder()
                .id(entity.getId())
                .requestId(entity.getRequestId())
                .legalId(entity.getLegalId())
                .status(entity.getStatus())
                .actionUsername(entity.getActionUsername())
                .remark(entity.getRemark())
                .createdAt(createdAtMillis)
                .build();
    }

    @Override
    public AllPendingAccountOpeningHistoryResponseDto getAllPendingAccountsHistory(AllPendingAccountHistoryRequestDto request) throws Exception {
        log.info("Fetching all pending accounts history with search: {}", request.getSearch());

        Sort.Direction direction = "DESC".equalsIgnoreCase(request.getSortDirection()) ? Sort.Direction.DESC : Sort.Direction.ASC;
        PageRequest pageable = PageRequest.of(request.getPageNo() - 1, request.getPageSize(), Sort.by(direction, request.getSortBy()));

        Page<PendingAccountOpeningRequest> page = pendingRequestRepository.findByStatus(AccountOpeningRequestStatusEnum.PENDING, pageable);

        List<PendingAccountOpeningHistoryDto> content = page.getContent().stream()
                .map(this::mapToDetailedHistoryDto)
                .collect(Collectors.toList());

        log.info("Found {} pending accounts", page.getTotalElements());

        return AllPendingAccountOpeningHistoryResponseDto.builder()
                .content(content)
                .pageNo(page.getNumber() + 1)
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    public PendingAccountAdminReviewDto getPendingAccountHistoryById(Long requestId) throws Exception {
        log.info("Fetching admin review details for request ID: {}", requestId);

        PendingAccountOpeningRequest request = pendingRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found: " + requestId));

        CustomerRequest customerData = null;
        try {
            if (request.getRequestData() != null) {
                customerData = objectMapper.readValue(request.getRequestData(), CustomerRequest.class);
            }
        } catch (Exception e) {
            log.warn("Failed to parse customer data for request: {}", requestId, e);
        }

        log.info("✓ Admin review details retrieved | Request ID: {}", requestId);
        return mapToAdminReviewDto(request, customerData);
    }

    private PendingAccountOpeningHistoryDto mapToDetailedHistoryDto(PendingAccountOpeningRequest entity) {
        return PendingAccountOpeningHistoryDto.builder()
                .requestId(entity.getId())
                .legalId(entity.getLegalId())
                .request(mapToDto(entity))
                .build();
    }

    private PendingAccountAdminReviewDto mapToAdminReviewDto(PendingAccountOpeningRequest request, CustomerRequest customerData) {
        Long createdAtMillis = null;
        if (request.getCreatedAt() != null) {
            createdAtMillis = request.getCreatedAt()
                    .atZone(ZoneId.systemDefault())
                    .toInstant()
                    .toEpochMilli();
        }

        PendingAccountAdminReviewDto.PendingAccountAdminReviewDtoBuilder builder = PendingAccountAdminReviewDto.builder()
                .requestId(request.getId())
                .legalId(request.getLegalId())
                .status(request.getStatus())
                .amlStatus(request.getAmlStatus())
                .createdAt(createdAtMillis)
                .amlResultData(request.getAmlResultData())
                .remark(request.getRemark());

        if (customerData != null) {
            builder.title(customerData.getTitle())
                    .givenName(customerData.getGivenName())
                    .familyName(customerData.getFamilyName())
                    .firstNameKh(customerData.getFirstNameKh())
                    .lastNameKh(customerData.getLastNameKh())
                    .gender(customerData.getGender())
                    .dateOfBirth(customerData.getDateOfBirth())
                    .nationality(customerData.getNationality())
                    .maritalStatus(customerData.getMaritalStatus())
                    .phoneNumber(customerData.getPhoneNumber())
                    .email(customerData.getEmail())
                    .customerCurrentProvince(customerData.getCustomerCurrentProvince())
                    .customerCurrentDistrict(customerData.getCustomerCurrentDistrict())
                    .customerCurrentCommune(customerData.getCustomerCurrentCommune())
                    .customerCurrentVillage(customerData.getCustomerCurrentVillage())
                    .legalAddress(customerData.getLegalAddress())
                    .customerPobProvince(customerData.getCustomerPobProvince())
                    .customerPobDistrict(customerData.getCustomerPobDistrict())
                    .customerPobCommune(customerData.getCustomerPobCommune())
                    .customerPobVillage(customerData.getCustomerPobVillage())
                    .placeOfBirth(customerData.getPlaceOfBirth())
                    .legalDocType(customerData.getLegalDocType())
                    .legalHolderName(customerData.getLegalHolderName())
                    .legalIssAuth(customerData.getLegalIssAuth())
                    .legalIssueDate(customerData.getLegalIssueDate())
                    .legalExpireDate(customerData.getLegalExpireDate())
                    .customerType(customerData.getCustomerType())
                    .companyName(customerData.getCompanyName())
                    .occupation(customerData.getOccupation())
                    .industry(customerData.getIndustry())
                    .sector(customerData.getSector())
                    .averageIncome(customerData.getAverageIncome())
                    .branchCode(customerData.getBranchCode())
                    .productAccount(customerData.getProductAccount())
                    .categoryAccount(customerData.getCategoryAccount())
                    .customerRole(customerData.getCustomerRole())
                    .nidImageName(customerData.getNidImageName())
                    .selfieImageName(customerData.getSelfieImageName());
        }

        return builder.build();
    }

    private void saveHistory(PendingAccountOpeningRequest request, AccountOpeningRequestStatusEnum status, String remark) {
        try {
            PendingAccountOpeningRequestHistory history = PendingAccountOpeningRequestHistory.builder()
                    .requestId(request.getId())
                    .legalId(request.getLegalId())
                    .status(status)
                    .actionUsername(securityUtils.getCurrentUser().getUsername())
                    .requestData(request.getRequestData())
                    .customerInfo(request.getCustomerInfo())
                    .amlResultData(request.getAmlResultData())
                    .remark(remark)
                    .build();
            historyRepository.save(history);
            log.debug("✓ History saved | Request ID: {} | Status: {}", request.getId(), status);
        } catch (Exception e) {
            log.error("Failed to save history for request: {}", request.getId(), e);
        }
    }
}
