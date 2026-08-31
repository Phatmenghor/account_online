package com.internal.feature.open_account.service.impl;

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

        request.setSector(AppConstants.DEFAULT_SECTOR);
        if (request.getProductAccount() == null || request.getProductAccount().isBlank()) {
            request.setProductAccount(AppConstants.PRODUCT_CODE);
        }

        String submittedBy = "Customer";
        try {
            String username = SecurityUtils.getCurrentUsername();
            if (username != null) {
                submittedBy = username;
            }
        } catch (Exception ignored) {}

        long start = System.currentTimeMillis();
        log.info("[OpenAccountService] Processing account opening started. legalId={}, submittedBy={}", legalId, submittedBy);

        OpenAccountContext context = new OpenAccountContext();
        context.setRequest(request);
        context.setSubmittedBy(submittedBy);

        try {
            log.info("[OpenAccountService] Step 1/10: Testing connection. legalId={}", legalId);
            currentStep = AppConstants.TEST_CONNECTION;
            bankingService.testConnection();

            log.info("[OpenAccountService] Step 2/10: Retrieving customer info. legalId={}", legalId);
            currentStep = AppConstants.GET_CUSTOMER_INFO;
            var customerInfo = bankingService.getCustomerInfo(legalId);
            context.setCustomerInfo(customerInfo);

            log.info("[OpenAccountService] Step 3/10: Validating existing accounts. legalId={}", legalId);
            currentStep = AppConstants.VALIDATE_EXISTING_ACCOUNT;
            bankingService.validateExistingAccounts(customerInfo);

            log.info("[OpenAccountService] Step 4/10: Processing AML. legalId={}", legalId);
            currentStep = AppConstants.PROCESS_AML;
            var amlResult = complianceService.processAml(request);
            context.setAmlResult(amlResult);
            String amlStatus = amlResult != null ? amlResult.getStatus().name() : "UNKNOWN";
            complianceService.sentMessageOnHighRisk(request, amlResult);

            log.info("[OpenAccountService] Step 5/10: Creating customer. legalId={}", legalId);
            currentStep = AppConstants.CREATE_CUSTOMER;
            CustomerCreationResult customerResult = bankingService.createCustomerIfNeeded(request, customerInfo);
            context.setCif(customerResult.getCif());
            context.setMnemonic(customerResult.getMnemonic());

            log.info("[OpenAccountService] Step 6/10: Creating USD account ($). legalId={}, cif={}", legalId, context.getCif());
            currentStep = AppConstants.CREATE_USD_ACCOUNT;
            context.setUsdAccount(bankingService.createAccountIfNeeded(request, customerInfo,
                    context.getCif(), AppConstants.CURRENCY_USD));

            log.info("[OpenAccountService] Step 7/10: Creating KHR account. legalId={}, cif={}", legalId, context.getCif());
            currentStep = AppConstants.CREATE_KHR_ACCOUNT;
            context.setKhrAccount(bankingService.createAccountIfNeeded(request, customerInfo,
                    context.getCif(), AppConstants.CURRENCY_KHR));

            log.info("[OpenAccountService] Step 8/10: Validating accounts created. legalId={}, cif={}", legalId, context.getCif());
            currentStep = AppConstants.VALIDATE_ACCOUNT_CREATION;
            bankingService.validateAllRequiredAccountsCreated(context.getCif(),
                    context.getKhrAccount(), context.getUsdAccount(), context.getCustomerInfo());

            log.info("[OpenAccountService] Step 9/10: Activating mobile banking. legalId={}, cif={}", legalId, context.getCif());
            currentStep = AppConstants.ACTIVATE_MOBILE_BANKING;
            context.setMbActivationCode(bankingService.activateMobileBanking(request, context.getCif(),
                    context.getKhrAccount(), context.getUsdAccount()));

            log.info("[OpenAccountService] Step 10/10: Saving success log. legalId={}, cif={}", legalId, context.getCif());
            eventPublisher.publishEvent(new AccountOpenedEvent(this, context));

            long duration = System.currentTimeMillis() - start;
            log.info("[OpenAccountService] Account opened successfully. legalId={}, cif={}, mnemonic={}, khrAccount={}, usdAccount={}, durationMs={}, submittedBy={}",
                    legalId, context.getCif(), context.getMnemonic(), context.getKhrAccount(),
                    context.getUsdAccount(), duration, submittedBy);

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
            log.error("[OpenAccountService] Account opening failed. step={}, legalId={}, durationMs={}, error={}",
                    currentStep, legalId, duration, e.getMessage(), e);
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
        java.util.Map<String, String> contextMap = org.slf4j.MDC.getCopyOfContextMap();
        return Mono.fromCallable(() -> {
            if (contextMap != null) {
                org.slf4j.MDC.setContextMap(contextMap);
            }
            try {
                return processAccountOpening(request);
            } finally {
                org.slf4j.MDC.clear();
            }
        })
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







