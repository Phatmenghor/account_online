package com.internal.integration.ports;

import com.internal.feature.open_account.dto.request.CustomerRequest;

public interface MobileBankingPort {
    String activate(CustomerRequest request, String cif, String khrAccount, String usdAccount);
}
