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

            log.info("Step 5: Processing AML | Legal ID: {}", legalId);
            currentStep = AppConstants.PROCESS_AML;
            var amlResult = complianceService.processAml(request);
            complianceService.sentMessageOnHighRisk(request, amlResult);

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
            PendingAccountOpeningRequest pendingRequest = PendingAccountOpeningRequest.builder()
                    .legalId(legalId)
                    .status(AccountOpeningRequestStatusEnum.PENDING)
                    .requestData(objectMapper.writeValueAsString(request))
                    .customerInfo(objectMapper.writeValueAsString(customerInfo))
                    .amlResultData(objectMapper.writeValueAsString(amlResult))
                    .amlStatus(amlResult != null ? amlResult.getStatus() : null)
                    .build();

            PendingAccountOpeningRequest saved = pendingRequestRepository.save(pendingRequest);
            log.info("✓ Request stored for admin approval | ID: {} | Legal ID: {} | AML Status: {}",
                    saved.getId(), legalId, amlStatus);

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
        try {
            CustomerResponse accountResponse = openAccount(customerRequest);
            log.info("✓ Account created successfully | CIF: {}", accountResponse.getCif());
        } catch (Exception e) {
            log.error("Failed to create account for approved request: {} | Error: {}", requestId, e.getMessage(), e);
            throw new OpenAccountException("ACCOUNT_CREATION_FAILED", AppConstants.FAILED_CREATE_ACCOUNT);
        }

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

        CustomerRequest customerData = null;
        try {
            if (entity.getRequestData() != null) {
                customerData = objectMapper.readValue(entity.getRequestData(), CustomerRequest.class);
            }
        } catch (Exception e) {
            log.warn("Failed to parse customer data for request: {}", entity.getId(), e);
        }

        PendingAccountOpeningRequestDto.PendingAccountOpeningRequestDtoBuilder builder = PendingAccountOpeningRequestDto.builder()
                .id(entity.getId())
                .legalId(entity.getLegalId())
                .status(entity.getStatus())
                .amlStatus(entity.getAmlStatus())
                .remark(entity.getRemark())
                .createdAt(createdAtIso)
                .message(message)
                .amlResultData(entity.getAmlResultData())
                .customerRole("OWNER");

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
    public AllPendingAccountOpeningHistoryResponseDto getAllPendingAccountsHistory(AllPendingAccountHistoryRequestDto request) throws Exception {
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

        List<PendingAccountOpeningHistoryDto> content = page.getContent().stream()
                .map(this::mapToDetailedHistoryDto)
                .collect(Collectors.toList());

        log.info("Found {} account records", page.getTotalElements());

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
        String createdAtIso = null;
        if (request.getCreatedAt() != null) {
            createdAtIso = request.getCreatedAt()
                    .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }

        PendingAccountAdminReviewDto.PendingAccountAdminReviewDtoBuilder builder = PendingAccountAdminReviewDto.builder()
                .requestId(request.getId())
                .legalId(request.getLegalId())
                .status(request.getStatus())
                .amlStatus(request.getAmlStatus())
                .createdAt(createdAtIso)
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
            log.info("✓ History saved | Request ID: {} | Status: {}", request.getId(), status);
        } catch (Exception e) {
            log.error("Failed to save history for request: {}", request.getId(), e);
        }
    }
}
