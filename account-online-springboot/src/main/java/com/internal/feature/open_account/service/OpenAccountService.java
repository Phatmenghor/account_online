package com.internal.feature.open_account.service;

import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.response.OpenAccountResponseDto;

public interface OpenAccountService {

    OpenAccountResponseDto processAccountOpening(CustomerRequest request) throws Exception;
}
