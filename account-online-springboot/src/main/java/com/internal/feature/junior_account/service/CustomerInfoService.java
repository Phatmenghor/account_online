package com.internal.feature.junior_account.service;

import com.internal.feature.junior_account.dto.response.CustomerInfoResponse;

public interface CustomerInfoService {
    CustomerInfoResponse getCustomerByCif(String cif);
}
