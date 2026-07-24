package com.internal.integration.ports;

import com.internal.feature.junior_account.dto.request.JuniorCustomerRequest;
import org.w3c.dom.Document;

/**
 * Port interface specifically for Junior Account T24 SOAP operations.
 */
public interface JuniorCoreBankingPort {
    Document createCustomer(JuniorCustomerRequest request);
    Document createAccount(JuniorCustomerRequest request, String cif, String currency);
}
