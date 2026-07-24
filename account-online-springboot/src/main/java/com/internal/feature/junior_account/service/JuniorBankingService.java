package com.internal.feature.junior_account.service;

import com.internal.config.TestProperties;
import com.internal.feature.junior_account.dto.request.JuniorCustomerRequest;
import com.internal.feature.open_account.dto.request.CustomerCreationResult;
import com.internal.feature.open_account.service.ValidationService;
import com.internal.integration.ports.JuniorCoreBankingPort;
import com.internal.integration.ports.MobileBankingPort;
import com.internal.integration.soap.t24.XmlParser;
import com.internal.shared.constant.AppConstants;
import com.internal.shared.exception.custom.NidValidationException;
import com.internal.shared.exception.custom.ValidateServiceException;
import com.internal.shared.exception.openaccount.AccountCreationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;

import java.util.Map;

/**
 * Dedicated banking service for Junior Account Opening.
 * Uses JuniorCoreBankingPort -> JuniorT24SoapAdapter -> JuniorAccountXmlBuilder
 * (Sector: 6012, Product: SAVE.JUNIOR.SAVING).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JuniorBankingService {

    private final ValidationService validationService;
    private final JuniorCoreBankingPort juniorCoreBankingPort;
    private final MobileBankingPort mobileBankingPort;
    private final JdbcTemplate jdbcTemplate;
    private final TestProperties isTestMode;

    public void testConnection() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        } catch (Exception e) {
            log.error("Junior banking DB connection test failed", e);
            throw new RuntimeException("Unable to connect to the server. Please try again later.");
        }
    }

    public Map<String, String> getCustomerInfo(String legalId) {
        log.info("Junior: GET_CUSTOMER_INFO for Legal ID: {}", legalId);
        Map<String, String> customerInfo = validationService.getCustomerInfo(legalId);
        log.info("Junior customer info retrieved: {}", customerInfo != null ? "Found" : "Not found");
        return customerInfo;
    }

    public void validateExistingAccounts(Map<String, String> customerInfo) {
        validationService.validateExistingAccounts(customerInfo);
    }

    public CustomerCreationResult createCustomerIfNeeded(JuniorCustomerRequest request, Map<String, String> customerInfo) {
        if (customerInfo != null) {
            String existingCif = customerInfo.get("CIF");
            if (existingCif != null && !existingCif.isEmpty()) {
                log.info("Existing CIF found for Junior request, using existing customer: {}", existingCif);
                String existingMnemonic = customerInfo.get("MNEMONIC");
                return new CustomerCreationResult(existingCif, existingMnemonic);
            }
        }

        return createCustomerWithRetry(request);
    }

    private CustomerCreationResult createCustomerWithRetry(JuniorCustomerRequest request) {
        int maxRetries = 3;
        int retryDelay = 3000;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                log.info("Calling juniorCoreBankingPort.createCustomer() - Attempt {} of {}", attempt, maxRetries);
                Document resp = juniorCoreBankingPort.createCustomer(request);
                String cif = XmlParser.extractCif(resp);
                String mnemonic = XmlParser.extractMnemonic(resp);
                log.info("New Junior customer created: CIF={}, MNEMONIC={}", cif, mnemonic);
                return new CustomerCreationResult(cif, mnemonic);
            } catch (Exception e) {
                log.warn("Attempt {} failed to create Junior customer: {}", attempt, e.getMessage());

                if (attempt < maxRetries) {
                    delayMs(retryDelay);
                    try {
                        Map<String, String> freshCustomerInfo = getCustomerInfo(request.getLegalId());
                        String createdCif = freshCustomerInfo != null ? freshCustomerInfo.get("CIF") : null;
                        if (createdCif != null && !createdCif.isEmpty()) {
                            log.info("Junior customer found in system: CIF={}", createdCif);
                            String mnemonic = freshCustomerInfo.get("MNEMONIC");
                            return new CustomerCreationResult(createdCif, mnemonic);
                        }
                    } catch (Exception verifyError) {
                        log.error("Failed to verify Junior customer info before retry: {}", verifyError.getMessage());
                        throw new AccountCreationException("Junior customer verification failed before retry");
                    }
                } else {
                    log.error("Max retries ({}) exceeded for Junior customer creation", maxRetries);
                    throw e;
                }
            }
        }
        throw new AccountCreationException("Junior customer creation failed after all retries");
    }

    public String createAccountIfNeeded(JuniorCustomerRequest request, Map<String, String> customerInfo, String cif, String currency) {
        if (isTestMode != null && isTestMode.isSkipCheckAccount()) {
            log.info("Test mode enabled, skipping existing account check for Junior {} account", currency);
            return createAccount(request, cif, currency);
        }

        if (customerInfo != null && validationService.hasAccount(customerInfo, currency)) {
            log.info("Junior {} account already exists in CBS, skipping creation", currency);
            return null;
        }

        return createAccountWithRetry(request, customerInfo, cif, currency);
    }

    private String createAccountWithRetry(JuniorCustomerRequest request, Map<String, String> customerInfo, String cif, String currency) {
        int maxRetries = 3;
        int retryDelay = 3000;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                log.info("Calling juniorCoreBankingPort.createAccount({}) - Attempt {} of {}", currency, attempt, maxRetries);
                return createAccount(request, cif, currency);
            } catch (Exception e) {
                log.warn("Attempt {} failed to create Junior {} account: {}", attempt, currency, e.getMessage());

                if (attempt < maxRetries) {
                    delayMs(retryDelay);
                    try {
                        Map<String, String> freshCustomerInfo = getCustomerInfo(request.getLegalId());
                        if (freshCustomerInfo != null && validationService.hasAccount(freshCustomerInfo, currency)) {
                            String existingAccount = freshCustomerInfo.get(currency);
                            log.info("Junior {} account found in system: {}", currency, existingAccount);
                            return existingAccount;
                        }
                    } catch (Exception verifyError) {
                        log.error("Failed to verify Junior customer info before retry: {}", verifyError.getMessage());
                        throw new AccountCreationException("Junior customer verification failed before retry");
                    }
                } else {
                    log.error("Max retries ({}) exceeded for Junior {} account creation", maxRetries, currency);
                    throw e;
                }
            }
        }
        return null;
    }

    private String createAccount(JuniorCustomerRequest request, String cif, String currency) {
        try {
            log.info("Creating Junior {} account for CIF: {}", currency, cif);
            Document response = juniorCoreBankingPort.createAccount(request, cif, currency);
            if (response == null) {
                log.warn("T24 returned null response for Junior {} account", currency);
                return null;
            }
            String accountNumber = XmlParser.extractAccountNumber(response);
            log.info("Junior {} account number extracted: {}", currency, accountNumber);
            return accountNumber;
        } catch (Exception e) {
            log.error("Error creating Junior {} account: {}", currency, e.getMessage());
            return null;
        }
    }

    public void validateAllRequiredAccountsCreated(String cif, String khrAccount, String usdAccount, Map<String, String> customerInfo) {
        if (cif == null || cif.isEmpty()) {
            throw new AccountCreationException("Junior CIF not found. Account creation failed.");
        }

        if (khrAccount == null || khrAccount.isEmpty()) {
            if (customerInfo == null || !validationService.hasAccount(customerInfo, AppConstants.CURRENCY_KHR)) {
                throw new AccountCreationException("Junior KHR account not found. Account creation failed.");
            }
        }

        if (usdAccount == null || usdAccount.isEmpty()) {
            if (customerInfo == null || !validationService.hasAccount(customerInfo, AppConstants.CURRENCY_USD)) {
                throw new AccountCreationException("Junior USD account not found. Account creation failed.");
            }
        }
    }

    public String activateMobileBanking(JuniorCustomerRequest request, String cif, String khrAccount, String usdAccount) {
        try {
            return mobileBankingPort.activate(request, cif, khrAccount, usdAccount);
        } catch (Exception e) {
            log.warn("Junior Mobile Banking activation failed (non-critical): {}", e.getMessage());
            return null;
        }
    }

    private void delayMs(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
