package com.internal.feature.open_account.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.internal.enumation.AccountOpeningRequestStatusEnum;
import com.internal.enumation.AmlStatusEnum;
import com.internal.exceptions.error.custom.NotFoundException;
import com.internal.exceptions.error.openaccount.OpenAccountException;
import com.internal.feature.aml.dto.response.AmlStatusDto;
import com.internal.feature.open_account.dto.OpenAccountContext;
import com.internal.feature.open_account.dto.response.AmlResultForPendingAccountDto;
import com.internal.feature.open_account.dto.request.ApproveAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.request.CustomerCreationResult;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.request.RejectAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.response.CustomerResponse;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.request.AllPendingAccountHistoryRequestDto;
import com.internal.feature.open_account.dto.response.AllPendingAccountOpeningHistoryResponseDto;
import com.internal.feature.open_account.dto.response.PendingAccountAdminReviewDto;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningHistoryDto;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestHistoryDto;
import com.internal.feature.open_account.dto.response.ReviewHistoryResponseDto;
import com.internal.feature.open_account.event.AccountOpenedEvent;
import com.internal.feature.open_account.facade.BankingService;
import com.internal.feature.open_account.facade.ComplianceService;
import com.internal.feature.open_account.facade.ReportingService;
import com.internal.feature.open_account.models.PendingAccountOpeningRequest;
import com.internal.feature.open_account.models.PendingAccountOpeningRequestHistory;
import com.internal.feature.open_account.repository.PendingAccountOpeningRequestRepository;
import com.internal.feature.open_account.repository.PendingAccountOpeningRequestHistoryRepository;
import com.internal.feature.open_account.service.OpenAccountService;
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
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
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
    private final PendingAccountOpeningRequestRepository pendingRequestRepository;
    private final PendingAccountOpeningRequestHistoryRepository historyRepository;
    private final SecurityUtils securityUtils;
    private final ObjectMapper objectMapper;

    @Transactional
    public CustomerResponse openAccount(CustomerRequest request) throws Exception {
        return openAccountInternal(request, true);
    }

    public CustomerResponse openAccountWithoutAml(CustomerRequest request) throws Exception {
        return openAccountInternal(request, false);
    }

    private CustomerResponse openAccountInternal(CustomerRequest request, boolean processAml) throws Exception {
        String legalId = request.getLegalId();
        log.info("Opening account | Legal ID: {}", legalId);

        OpenAccountContext context = OpenAccountContext.builder().request(request).build();
        String currentStep = "START";

        try {
            log.info("Step 1: Testing connection | Legal ID: {}", legalId);
            currentStep = AppConstants.TEST_CONNECTION;
            bankingService.testConnection();

            log.info("Step 2: Checking existing account | Legal ID: {}", legalId);
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

            log.info("Step 3: Retrieving customer info | Legal ID: {}", legalId);
            currentStep = AppConstants.GET_CUSTOMER_INFO;
            Map<String, String> customerInfo = bankingService.getCustomerInfo(legalId);

            log.info("Step 4: Validating accounts | Legal ID: {}", legalId);
            currentStep = AppConstants.VALIDATE_EXISTING_ACCOUNT;
            bankingService.validateExistingAccounts(customerInfo);

            if (processAml) {
                log.info("Step 5: Processing AML | Legal ID: {}", legalId);
                currentStep = AppConstants.PROCESS_AML;
                var amlResult = complianceService.processAml(request);
                complianceService.sentMessageOnHighRisk(request, amlResult);
            } else {
                log.info("Step 5: Skipping AML (already processed during submission) | Legal ID: {}", legalId);
            }

            log.info("Step 6: Creating customer | Legal ID: {}", legalId);
            currentStep = AppConstants.CREATE_CUSTOMER;
            CustomerCreationResult customerResult = bankingService.createCustomerIfNeeded(request, customerInfo);
            context.setCif(customerResult.getCif());
            context.setMnemonic(customerResult.getMnemonic());

            log.info("Step 7: Creating KHR account | CIF: {}", context.getCif());
            currentStep = AppConstants.CREATE_KHR_ACCOUNT;
            context.setKhrAccount(bankingService.createAccountIfNeeded(request, customerInfo,
                    context.getCif(), AppConstants.CURRENCY_KHR));

            log.info("Step 8: Creating USD account | CIF: {}", context.getCif());
            currentStep = AppConstants.CREATE_USD_ACCOUNT;
            context.setUsdAccount(bankingService.createAccountIfNeeded(request, customerInfo,
                    context.getCif(), AppConstants.CURRENCY_USD));

            log.info("Step 9: Validating accounts | CIF: {}", context.getCif());
            currentStep = AppConstants.VALIDATE_ACCOUNT_CREATION;
            bankingService.validateAllRequiredAccountsCreated(context.getCif(),
                    context.getKhrAccount(),
                    context.getUsdAccount());

            log.info("Step 10: Activating mobile banking | CIF: {}", context.getCif());
            currentStep = AppConstants.ACTIVATE_MOBILE_BANKING;
            context.setMbActivationCode(bankingService.activateMobileBanking(request, context.getCif(),
                    context.getKhrAccount(), context.getUsdAccount()));

            CustomerResponse accInfo = complianceService.buildCustomerAccInfo(
                    context.getCif(), context.getKhrAccount(), context.getUsdAccount(),
                    context.getMnemonic());

            eventPublisher.publishEvent(new AccountOpenedEvent(this, context));

            log.info("✓ Account created successfully | CIF: {} | Mnemonic: {} | KHR: {} | USD: {}",
                    context.getCif(), context.getMnemonic(), context.getKhrAccount(), context.getUsdAccount());

            return accInfo;

        } catch (Exception e) {
            log.error("Account opening failed at step: {} | Legal ID: {} | Error: {}", currentStep, legalId, e.getMessage(), e);
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
            throw new OpenAccountException("PENDING_REQUEST_EXISTS", AppConstants.PENDING_REQUEST_ALREADY_EXISTS);
        }

        try {
            log.info("Step 1: Testing connection");
            bankingService.testConnection();

            log.info("Step 2: Checking existing account");
            var recoveryResult = bankingService.checkExistingCompleteAccountAndActivate(request);
            if (recoveryResult.isPresent()) {
                throw new OpenAccountException("ACCOUNT_ALREADY_EXISTS", AppConstants.ACCOUNT_ALREADY_EXISTS_FOR_LEGAL_ID);
            }

            log.info("Step 3: Retrieving customer info | Legal ID: {}", legalId);
            Map<String, String> customerInfo = bankingService.getCustomerInfo(legalId);

            log.info("Step 4: Validating accounts | Legal ID: {}", legalId);
            bankingService.validateExistingAccounts(customerInfo);

            log.info("Step 5: Processing AML | Legal ID: {}", legalId);
            var amlResult = complianceService.processAml(request);
            String amlStatus = amlResult != null ? amlResult.getStatus().name() : "UNKNOWN";
            complianceService.sentMessageOnHighRisk(request, amlResult);

            log.info("Step 6: Storing request for admin review | Legal ID: {}", legalId);
            PendingAccountOpeningRequest pendingRequest = mapRequestToPendingEntity(request, customerInfo, amlResult);

            PendingAccountOpeningRequest saved = pendingRequestRepository.save(pendingRequest);
            log.info("✓ Request stored for admin approval | ID: {} | Legal ID: {} | AML Status: {}",
                    saved.getId(), legalId, amlStatus);

            // Save initial PENDING status to history
            saveHistory(saved, AccountOpeningRequestStatusEnum.PENDING, "Account opening request submitted");

            return mapToDto(saved);

        } catch (OpenAccountException e) {
            log.warn("Request submission rejected | Legal ID: {} | Reason: {}", legalId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Request submission error | Legal ID: {} | Error: {}", legalId, e.getMessage(), e);
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
            throw new OpenAccountException("INVALID_STATUS", AppConstants.INVALID_STATUS_ONLY_PENDING_CAN_APPROVE);
        }

        CustomerRequest customerRequest = null;
        if (pendingRequest.getRequestData() != null) {
            try {
                customerRequest = objectMapper.readValue(pendingRequest.getRequestData(), CustomerRequest.class);
            } catch (Exception e) {
                log.error("Failed to parse customer data for request: {} | Error: {}", requestId, e.getMessage(), e);
                throw new OpenAccountException("INVALID_REQUEST_DATA", AppConstants.FAILED_PARSE_CUSTOMER_DATA);
            }
        }

        log.info("Creating account for approved request | Legal ID: {}", pendingRequest.getLegalId());
        CustomerResponse accountResponse = null;
        try {
            accountResponse = openAccountWithoutAml(customerRequest);
            log.info("✓ Account created successfully | CIF: {}", accountResponse.getCif());
        } catch (OpenAccountException e) {
            // Date validation or other account opening errors - pass message to admin
            log.warn("Date/Validation error caught in approval: [{}] {}", e.getErrorCode(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Failed to create account for approved request: {} | Error type: {} | Message: {}",
                requestId, e.getClass().getSimpleName(), e.getMessage(), e);
            // Pass the actual error message to admin (e.g., date validation errors, T24 errors)
            String errorMessage = e.getMessage() != null ? e.getMessage() : AppConstants.FAILED_CREATE_ACCOUNT;
            throw new OpenAccountException("ACCOUNT_CREATION_FAILED", errorMessage);
        }

        pendingRequest.setStatus(AccountOpeningRequestStatusEnum.APPROVED);
        pendingRequest.setRemark(dto.getRemark());

        // Store account details after successful creation
        if (accountResponse != null) {
            pendingRequest.setCif(accountResponse.getCif());
            pendingRequest.setMnemonic(accountResponse.getMnemonic());
            pendingRequest.setKhrAccount(accountResponse.getKhrAccount());
            pendingRequest.setUsdAccount(accountResponse.getUsdAccount());
        }

        PendingAccountOpeningRequest saved = pendingRequestRepository.save(pendingRequest);
        saveHistory(saved, AccountOpeningRequestStatusEnum.APPROVED, dto.getRemark());

        log.info("✓ Request approved and account created | ID: {} | Legal ID: {} | CIF: {}", saved.getId(), saved.getLegalId(), saved.getCif());

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
            throw new OpenAccountException("INVALID_STATUS", AppConstants.INVALID_STATUS_ONLY_PENDING_CAN_REJECT);
        }

        pendingRequest.setStatus(AccountOpeningRequestStatusEnum.REJECTED);
        pendingRequest.setRemark(dto.getRemark());

        PendingAccountOpeningRequest saved = pendingRequestRepository.save(pendingRequest);
        saveHistory(saved, AccountOpeningRequestStatusEnum.REJECTED, dto.getRemark());

        log.info("✓ Request rejected | ID: {} | Legal ID: {}", saved.getId(), saved.getLegalId());

        return mapToDto(saved);
    }

    private PendingAccountOpeningRequestDto mapToDto(PendingAccountOpeningRequest entity) {
        String createdAtIso = null;
        if (entity.getCreatedAt() != null) {
            createdAtIso = entity.getCreatedAt()
                    .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }

        String message = getStatusMessage(entity.getStatus());

        Object requestDataObj = null;
        try {
            if (entity.getRequestData() != null) {
                requestDataObj = objectMapper.readValue(entity.getRequestData(), Object.class);
            }
        } catch (Exception e) {
            log.warn("Failed to parse requestData: {}", e.getMessage());
        }

        Object customerInfoObj = null;
        try {
            if (entity.getCustomerInfo() != null && !entity.getCustomerInfo().isEmpty()) {
                customerInfoObj = objectMapper.readValue(entity.getCustomerInfo(), Object.class);
            }
        } catch (Exception e) {
            log.warn("Failed to parse customerInfo: {}", e.getMessage());
        }

        AmlResultForPendingAccountDto amlResultData = null;
        try {
            if (entity.getAmlResultData() != null && !entity.getAmlResultData().isEmpty()) {
                amlResultData = objectMapper.readValue(entity.getAmlResultData(), AmlResultForPendingAccountDto.class);
            }
        } catch (Exception e) {
            log.warn("Failed to parse amlResultData: {}", e.getMessage());
        }

        return PendingAccountOpeningRequestDto.builder()
                .id(entity.getId())
                .legalId(entity.getLegalId())
                .status(entity.getStatus())
                .createdAt(createdAtIso)
                .remark(entity.getRemark())
                .amlStatus(entity.getAmlStatus())
                .amlResultData(amlResultData)
                // Legal/NID info
                .legalDocName(entity.getLegalDocName())
                .legalHolderName(entity.getLegalHolderName())
                .legalFirstNameEn(entity.getLegalFirstNameEn())
                .legalLastNameEn(entity.getLegalLastNameEn())
                .legalFirstNameKh(entity.getLegalFirstNameKh())
                .legalLastNameKh(entity.getLegalLastNameKh())
                .legalDateOfBirth(entity.getLegalDateOfBirth())
                .legalGender(entity.getLegalGender())
                .legalAddress(entity.getLegalAddress())
                .legalPlaceOfBirth(entity.getLegalPlaceOfBirth())
                .legalIssuedDate(entity.getLegalIssuedDate())
                .legalExpiredDate(entity.getLegalExpiredDate())
                .legalMRZ1(entity.getLegalMRZ1())
                .legalMRZ2(entity.getLegalMRZ2())
                .legalMRZ3(entity.getLegalMRZ3())
                // Customer info
                .title(entity.getTitle())
                .maritalStatus(entity.getMaritalStatus())
                .nationality(entity.getNationality())
                .companyName(entity.getCompanyName())
                .occupation(entity.getOccupation())
                .industry(entity.getIndustry())
                .sector(entity.getSector())
                .averageIncome(entity.getAverageIncome())
                .phoneNumber(entity.getPhoneNumber())
                .email(entity.getEmail())
                // Current address
                .customerProvince(entity.getCustomerProvince())
                .customerDistrict(entity.getCustomerDistrict())
                .customerCommune(entity.getCustomerCommune())
                .customerVillage(entity.getCustomerVillage())
                // Place of birth
                .customerPobProvince(entity.getCustomerPobProvince())
                .customerPobDistrict(entity.getCustomerPobDistrict())
                .customerPobCommune(entity.getCustomerPobCommune())
                .customerPobVillage(entity.getCustomerPobVillage())
                // Branch info
                .branchCode(entity.getBranchCode())
                // Banking info
                .productAccount(entity.getProductAccount())
                .categoryAccount(entity.getCategoryAccount())
                .customerRole(entity.getCustomerRole())
                .loanOfficer(entity.getLoanOfficer())
                .releasedBy(entity.getReleasedBy())
                // Images
                .nidImageName(entity.getNidImageName())
                .selfieImageName(entity.getSelfieImageName())
                // Account details (populated after approval)
                .cif(entity.getCif())
                .mnemonic(entity.getMnemonic())
                .khrAccount(entity.getKhrAccount())
                .usdAccount(entity.getUsdAccount())
                .build();
    }

    private AmlStatusDto filterAmlResultData(AmlStatusDto amlResult) {
        if (amlResult == null) {
            return null;
        }
        // Clear duplicate customer fields to keep amlResultData clean and focused on AML screening
        amlResult.setCurrentAddressName(null);
        amlResult.setCurrentAddressCode(null);
        amlResult.setPlaceOfBirthName(null);
        amlResult.setPlaceOfBirthCode(null);
        amlResult.setMaritalStatus(null);
        amlResult.setOccupationCode(null);
        amlResult.setOccupationStatus(null);
        amlResult.setRemarks(null);
        // Keep nidImageName and selfieImageName as they're part of the AML audit trail
        return amlResult;
    }

    private String getStatusMessage(AccountOpeningRequestStatusEnum status) {
        if (status == null) {
            return AppConstants.MSG_GENERIC_ERROR;
        }
        return switch (status) {
            case PENDING -> AppConstants.SUBMIT_SUCCESS_MESSAGE;
            case APPROVED -> AppConstants.APPROVE_SUCCESS_MESSAGE;
            case REJECTED -> AppConstants.REJECT_SUCCESS_MESSAGE;
            default -> AppConstants.MSG_GENERIC_ERROR;
        };
    }

    private PendingAccountOpeningRequestHistoryDto mapHistoryToDto(PendingAccountOpeningRequestHistory entity) {
        String createdAtIso = null;
        if (entity.getCreatedAt() != null) {
            createdAtIso = entity.getCreatedAt()
                    .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }

        return PendingAccountOpeningRequestHistoryDto.builder()
                .id(entity.getId())
                .requestId(entity.getRequestId())
                .legalId(entity.getLegalId())
                .status(entity.getStatus())
                .actionUsername(entity.getActionUsername())
                .remark(entity.getRemark())
                .createdAt(createdAtIso)
                .build();
    }

    @Override
    public PaginationResponse<PendingAccountAdminReviewDto> getAllPendingAccountsHistory(AllPendingAccountHistoryRequestDto request) throws Exception {
        log.info("Fetching accounts history with search: {} | Status filter: {}", request.getSearch(), request.getStatus());

        Sort.Direction direction = "DESC".equalsIgnoreCase(request.getSortDirection()) ? Sort.Direction.DESC : Sort.Direction.ASC;
        PageRequest pageable = PageRequest.of(request.getPageNo() - 1, request.getPageSize(), Sort.by(direction, request.getSortBy()));

        Page<PendingAccountOpeningRequest> page;
        if (request.getStatus() != null && !request.getStatus().isEmpty() && !"ALL".equalsIgnoreCase(request.getStatus())) {
            AccountOpeningRequestStatusEnum status = AccountOpeningRequestStatusEnum.valueOf(request.getStatus().toUpperCase());
            page = pendingRequestRepository.findByStatus(status, pageable);
        } else {
            page = pendingRequestRepository.findAll(pageable);
        }

        List<PendingAccountAdminReviewDto> content = page.getContent().stream()
                .map(entity -> {
                    CustomerRequest customerData = null;
                    try {
                        if (entity.getRequestData() != null) {
                            customerData = objectMapper.readValue(entity.getRequestData(), CustomerRequest.class);
                        }
                    } catch (Exception e) {
                        log.warn("Failed to parse customer data for request: {}", entity.getId(), e);
                    }
                    return mapToAdminReviewDto(entity, customerData);
                })
                .collect(Collectors.toList());

        log.info("Found {} account records", page.getTotalElements());

        return new PaginationResponse<>(content, page.getNumber() + 1, page.getSize(), page.getTotalElements());
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
        String createdAtIso = null;
        if (request.getCreatedAt() != null) {
            createdAtIso = request.getCreatedAt()
                    .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }

        String updatedAtIso = null;
        if (request.getUpdatedAt() != null) {
            updatedAtIso = request.getUpdatedAt()
                    .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }

        Object requestDataObj = null;
        try {
            if (request.getRequestData() != null) {
                requestDataObj = objectMapper.readValue(request.getRequestData(), Object.class);
            }
        } catch (Exception e) {
            log.warn("Failed to parse requestData: {}", e.getMessage());
        }

        Object customerInfoObj = null;
        try {
            if (request.getCustomerInfo() != null && !request.getCustomerInfo().isEmpty()) {
                customerInfoObj = objectMapper.readValue(request.getCustomerInfo(), Object.class);
            }
        } catch (Exception e) {
            log.warn("Failed to parse customerInfo: {}", e.getMessage());
        }

        AmlResultForPendingAccountDto amlResultData = null;
        try {
            if (request.getAmlResultData() != null && !request.getAmlResultData().isEmpty()) {
                amlResultData = objectMapper.readValue(request.getAmlResultData(), AmlResultForPendingAccountDto.class);
            }
        } catch (Exception e) {
            log.warn("Failed to parse amlResultData: {}", e.getMessage());
        }

        return PendingAccountAdminReviewDto.builder()
                .requestId(request.getId())
                .legalId(request.getLegalId())
                .status(request.getStatus())
                .createdAt(createdAtIso)
                .updatedAt(updatedAtIso)
                .amlStatus(request.getAmlStatus())
                .amlResultData(amlResultData)
                .remark(request.getRemark())
                // Legal/NID info
                .legalDocName(request.getLegalDocName())
                .legalHolderName(request.getLegalHolderName())
                .legalFirstNameEn(request.getLegalFirstNameEn())
                .legalLastNameEn(request.getLegalLastNameEn())
                .legalFirstNameKh(request.getLegalFirstNameKh())
                .legalLastNameKh(request.getLegalLastNameKh())
                .legalDateOfBirth(request.getLegalDateOfBirth())
                .legalGender(request.getLegalGender())
                .legalAddress(request.getLegalAddress())
                .legalPlaceOfBirth(request.getLegalPlaceOfBirth())
                .legalIssuedDate(request.getLegalIssuedDate())
                .legalExpiredDate(request.getLegalExpiredDate())
                .legalMRZ1(request.getLegalMRZ1())
                .legalMRZ2(request.getLegalMRZ2())
                .legalMRZ3(request.getLegalMRZ3())
                // Customer info
                .title(request.getTitle())
                .maritalStatus(request.getMaritalStatus())
                .nationality(request.getNationality())
                .companyName(request.getCompanyName())
                .occupation(request.getOccupation())
                .industry(request.getIndustry())
                .sector(request.getSector())
                .averageIncome(request.getAverageIncome())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                // Current address
                .customerProvince(request.getCustomerProvince())
                .customerDistrict(request.getCustomerDistrict())
                .customerCommune(request.getCustomerCommune())
                .customerVillage(request.getCustomerVillage())
                // Place of birth
                .customerPobProvince(request.getCustomerPobProvince())
                .customerPobDistrict(request.getCustomerPobDistrict())
                .customerPobCommune(request.getCustomerPobCommune())
                .customerPobVillage(request.getCustomerPobVillage())
                // Branch info
                .branchCode(request.getBranchCode())
                // Banking info
                .productAccount(request.getProductAccount())
                .categoryAccount(request.getCategoryAccount())
                .customerRole(request.getCustomerRole())
                .loanOfficer(request.getLoanOfficer())
                .releasedBy(request.getReleasedBy())
                // Images
                .nidImageName(request.getNidImageName())
                .selfieImageName(request.getSelfieImageName())
                .build();
    }

    @Override
    public ReviewHistoryResponseDto getReviewHistory(Long requestId) throws Exception {
        log.info("Fetching review history for request ID: {}", requestId);

        PendingAccountOpeningRequest request = pendingRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found: " + requestId));

        List<PendingAccountOpeningRequestHistory> historyRecords = historyRepository.findByRequestIdOrderByCreatedAtDesc(requestId);

        List<PendingAccountOpeningRequestHistoryDto> historyDtos = historyRecords.stream()
                .map(this::mapHistoryToDto)
                .collect(Collectors.toList());

        log.info("✓ Found {} history records for request: {}", historyDtos.size(), requestId);

        return ReviewHistoryResponseDto.builder()
                .requestId(request.getId())
                .legalId(request.getLegalId())
                .history(historyDtos)
                .build();
    }

    @Override
    public PaginationResponse<PendingAccountOpeningRequestHistoryDto> getAllOpeningRequestHistory(AllPendingAccountHistoryRequestDto request) throws Exception {
        log.info("Fetching all opening request history with search: {} | Status filter: {}", request.getSearch(), request.getStatus());

        Sort.Direction direction = "DESC".equalsIgnoreCase(request.getSortDirection()) ? Sort.Direction.DESC : Sort.Direction.ASC;
        PageRequest pageable = PageRequest.of(request.getPageNo() - 1, request.getPageSize(), Sort.by(direction, "createdAt"));

        Page<PendingAccountOpeningRequestHistory> page = historyRepository.findAllByOrderByCreatedAtDesc(pageable);

        List<PendingAccountOpeningRequestHistoryDto> content = page.getContent().stream()
                .map(this::mapHistoryToDto)
                .collect(Collectors.toList());

        log.info("✓ Found {} history records | Total: {} | Page: {}", content.size(), page.getTotalElements(), request.getPageNo());

        return new PaginationResponse<>(content, request.getPageNo(), request.getPageSize(), page.getTotalElements());
    }

    private void saveHistory(PendingAccountOpeningRequest request, AccountOpeningRequestStatusEnum status, String remark) {
        try {
            String actionUsername = "System";
            try {
                actionUsername = securityUtils.getCurrentUser().getUsername();
            } catch (Exception e) {
                log.debug("No authenticated user found, using System for history");
            }

            PendingAccountOpeningRequestHistory history = PendingAccountOpeningRequestHistory.builder()
                    .requestId(request.getId())
                    .legalId(request.getLegalId())
                    .status(status)
                    .actionUsername(actionUsername)
                    .requestData(request.getRequestData())
                    .customerInfo(request.getCustomerInfo())
                    .amlResultData(request.getAmlResultData())
                    .remark(remark)
                    .build();
            historyRepository.save(history);
            log.info("✓ History saved | Request ID: {} | Status: {} | By: {}", request.getId(), status, actionUsername);
        } catch (Exception e) {
            log.error("Failed to save history for request: {}", request.getId(), e);
        }
    }

    private PendingAccountOpeningRequest mapRequestToPendingEntity(CustomerRequest request, Map<String, String> customerInfo, AmlStatusDto amlResult) throws JsonProcessingException {
        // Enrich AML result with image data
        if (amlResult != null) {
            amlResult.setNidImageName(request.getNidImageName());
            amlResult.setSelfieImageName(request.getSelfieImageName());
        }

        // Convert to clean DTO (no duplicate customer data)
        String amlResultDataJson = null;
        if (amlResult != null) {
            AmlResultForPendingAccountDto cleanAmlDto = mapToCleanAmlResultDto(amlResult);
            ObjectMapper nonNullMapper = new ObjectMapper()
                    .setSerializationInclusion(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL);
            amlResultDataJson = nonNullMapper.writeValueAsString(cleanAmlDto);
        }

        PendingAccountOpeningRequest.PendingAccountOpeningRequestBuilder builder = PendingAccountOpeningRequest.builder()
                .legalId(request.getLegalId())
                .status(AccountOpeningRequestStatusEnum.PENDING)
                .requestData(objectMapper.writeValueAsString(request))
                .customerInfo(objectMapper.writeValueAsString(customerInfo))
                .amlResultData(amlResultDataJson)
                .amlStatus(amlResult != null ? amlResult.getStatus() : null);

        // === LEGAL / NID INFO ===
        builder.legalDocName(request.getLegalDocType())
                .legalFirstNameEn(request.getGivenName())
                .legalLastNameEn(request.getFamilyName())
                .legalFirstNameKh(request.getFirstNameKh())
                .legalLastNameKh(request.getLastNameKh())
                .legalGender(request.getGender())
                .legalAddress(request.getLegalAddress())
                .legalPlaceOfBirth(request.getPlaceOfBirth());

        if (request.getDateOfBirth() != null) {
            try {
                builder.legalDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
            } catch (Exception e) {
                log.warn("Failed to parse date of birth: {}", request.getDateOfBirth());
            }
        }

        if (request.getLegalIssueDate() != null) {
            try {
                builder.legalIssuedDate(LocalDate.parse(request.getLegalIssueDate()));
            } catch (Exception e) {
                log.warn("Failed to parse issued date: {}", request.getLegalIssueDate());
            }
        }

        if (request.getLegalExpireDate() != null) {
            try {
                builder.legalExpiredDate(LocalDate.parse(request.getLegalExpireDate()));
            } catch (Exception e) {
                log.warn("Failed to parse expired date: {}", request.getLegalExpireDate());
            }
        }

        builder.legalMRZ1(request.getLegalMrz1())
                .legalMRZ2(request.getLegalMrz2())
                .legalMRZ3(request.getLegalMrz3());

        // === CUSTOMER INFO ===
        builder.title(request.getTitle())
                .maritalStatus(request.getMaritalStatus())
                .nationality(request.getNationality())
                .companyName(request.getCompanyName())
                .occupation(request.getOccupation())
                .industry(request.getIndustry())
                .sector(request.getSector())
                .averageIncome(request.getAverageIncome())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .customerType(request.getCustomerType());

        // === CURRENT ADDRESS ===
        builder.customerProvinceCode(request.getCustomerCurrentProvince())
                .customerDistrictCode(request.getCustomerCurrentDistrict())
                .customerCommuneCode(request.getCustomerCurrentCommune())
                .customerVillageCode(request.getCustomerCurrentVillage());

        // === PLACE OF BIRTH ===
        builder.customerPobProvinceCode(request.getCustomerPobProvince())
                .customerPobDistrictCode(request.getCustomerPobDistrict())
                .customerPobCommuneCode(request.getCustomerPobCommune())
                .customerPobVillageCode(request.getCustomerPobVillage());

        // === BRANCH INFO ===
        builder.branchCode(request.getBranchCode());

        // === BANKING INFO ===
        builder.productAccount(request.getProductAccount())
                .categoryAccount(request.getCategoryAccount())
                .customerRole(request.getCustomerRole())
                .loanOfficer(request.getLoanOfficer())
                .releasedBy(request.getReleasedBy());

        // === IMAGES ===
        builder.nidImageName(request.getNidImageName())
                .selfieImageName(request.getSelfieImageName());

        // === AML DETAILS ===
        if (amlResult != null) {
            builder.amlRiskLevel(amlResult.getRiskLevel())
                    .amlActionTaken(amlResult.getActionTaken())
                    .amlTotalRulesScore(amlResult.getTotalRulesScore())
                    .amlTrxnId(amlResult.getTrxnID())
                    .serviceName(amlResult.getServiceName());

            if (amlResult.getRulesTriggered() != null && !amlResult.getRulesTriggered().isEmpty()) {
                builder.amlRulesTriggered(amlResult.getRulesTriggered());
            }
        }

        return builder.build();
    }

    private AmlResultForPendingAccountDto mapToCleanAmlResultDto(AmlStatusDto amlResult) {
        return AmlResultForPendingAccountDto.builder()
                .id(amlResult.getId())
                .customerInfo(amlResult.getCustomerInfo())
                .status(amlResult.getStatus())
                .screeningResult(amlResult.getScreeningResult())
                .riskLevel(amlResult.getRiskLevel())
                .actionTaken(amlResult.getActionTaken())
                .rulesTriggered(amlResult.getRulesTriggered())
                .serviceName(amlResult.getServiceName())
                .totalRulesScore(amlResult.getTotalRulesScore())
                .trxnID(amlResult.getTrxnID())
                .approvedBy(amlResult.getApprovedBy())
                .rejectedBy(amlResult.getRejectedBy())
                .createdAt(amlResult.getCreatedAt())
                .updatedAt(amlResult.getUpdatedAt())
                .nidImageName(amlResult.getNidImageName())
                .selfieImageName(amlResult.getSelfieImageName())
                .build();
    }
}
