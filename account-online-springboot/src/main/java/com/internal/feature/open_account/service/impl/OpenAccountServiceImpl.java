package com.internal.feature.open_account.service.impl;

import com.internal.enumation.AccountOpeningRequestStatusEnum;
import com.internal.feature.open_account.dto.request.OpenAccountContext;
import com.internal.feature.open_account.dto.request.CustomerCreationResult;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.response.OpenAccountResponseDto;
import com.internal.feature.open_account.event.AccountOpenedEvent;
import com.internal.feature.open_account.service.BankingService;
import com.internal.feature.open_account.service.ComplianceService;
import com.internal.feature.open_account.service.ReportingService;
import com.internal.feature.open_account.service.OpenAccountService;
import com.internal.shared.util.SecurityUtils;
import com.internal.shared.constant.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAccountServiceImpl implements OpenAccountService {

    private final BankingService bankingService;
    private final ComplianceService complianceService;
    private final ReportingService reportingService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public OpenAccountResponseDto processAccountOpening(CustomerRequest request) throws Exception {
        String legalId = request.getLegalId();
        String currentStep = "START";

        // Always enforce Standard account sector (6011) and product (SAVE.ACCT.ONLINE) on backend
        request.setSector(AppConstants.DEFAULT_SECTOR);
        request.setProductAccount(AppConstants.PRODUCT_CODE);

        String submittedBy = "Customer";
        try {
            String username = SecurityUtils.getCurrentUsername();
            if (username != null) {
                submittedBy = username;
            }
        } catch (Exception ignored) {}

        log.info("Processing account opening | Legal ID: {} | Submitted by: {}", legalId, submittedBy);

        OpenAccountContext context = OpenAccountContext.builder().request(request).submittedBy(submittedBy).build();

        try {
            log.info("Step 1: Testing connection | Legal ID: {}", legalId);
            currentStep = AppConstants.TEST_CONNECTION;
            bankingService.testConnection();

            log.info("Step 2: Retrieving customer info | Legal ID: {}", legalId);
            currentStep = AppConstants.GET_CUSTOMER_INFO;
            var customerInfo = bankingService.getCustomerInfo(legalId);
            context.setCustomerInfo(customerInfo);

            log.info("Step 3: Validating existing accounts | Legal ID: {}", legalId);
            currentStep = AppConstants.VALIDATE_EXISTING_ACCOUNT;
            bankingService.validateExistingAccounts(customerInfo);

            log.info("Step 4: Processing AML | Legal ID: {}", legalId);
            currentStep = AppConstants.PROCESS_AML;
            var amlResult = complianceService.processAml(request);
            context.setAmlResult(amlResult);
            String amlStatus = amlResult != null ? amlResult.getStatus().name() : "UNKNOWN";
            complianceService.sentMessageOnHighRisk(request, amlResult);

            log.info("Step 5: Creating customer | Legal ID: {}", legalId);
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

            log.info("Step 10: Saving success log | Legal ID: {}", legalId);
            eventPublisher.publishEvent(new AccountOpenedEvent(this, context));

            log.info("Account opened successfully | CIF: {} | Mnemonic: {} | KHR: {} | USD: {} | MB: {} | By: {}",
                    context.getCif(), context.getMnemonic(), context.getKhrAccount(),
                    context.getUsdAccount(), context.getMbActivationCode(), submittedBy);

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
            log.error("Account opening failed at step: {} | Legal ID: {} | Error: {}",
                    currentStep, legalId, e.getMessage());
            final String failureRemark = reportingService.buildFailureRemark(
                    currentStep, context.getCif(), context.getKhrAccount(),
                    context.getUsdAccount(), context.getAmlResult());
            reportingService.saveFailureLogs(request, e, currentStep, failureRemark, false);
            throw e;
        }
    }

    @Override
    public Mono<OpenAccountResponseDto> processAccountOpeningReactive(CustomerRequest request) {
        String legalId = request.getLegalId();
        return Mono.fromCallable(() -> processAccountOpening(request))
                .subscribeOn(Schedulers.boundedElastic())
                .doOnCancel(() -> {
                    log.warn("Account opening process CANCELLED by client/user connection drop | Legal ID: {}", legalId);
                    try {
                        reportingService.saveFailureLogs(request,
                                new RuntimeException("CLIENT_CANCELLED: Account opening cancelled due to client connection drop"),
                                "CANCELLED_BY_CLIENT",
                                "User disconnected or closed connection before account opening completed",
                                false);
                    } catch (Exception ex) {
                        log.error("Failed to save cancellation log for Legal ID: {}", legalId, ex);
                    }
                })
                .doOnDiscard(OpenAccountResponseDto.class, response -> {
                    log.info("Discarding account opening response because connection was terminated prematurely for Legal ID: {}", legalId);
                });
    }
}







