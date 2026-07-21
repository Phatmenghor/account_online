package com.internal.integration.ports;

import com.internal.feature.open_account.dto.request.CustomerRequest;
import org.w3c.dom.Document;

public interface CoreBankingPort {
    Document createCustomer(CustomerRequest request);
    Document createAccount(CustomerRequest request, String cif, String currency);
}
