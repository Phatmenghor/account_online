package com.internal.feature.open_account.service;

import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.response.OpenAccountResponseDto;
import reactor.core.publisher.Mono;

public interface OpenAccountService {

    OpenAccountResponseDto processAccountOpening(CustomerRequest request) throws Exception;

    Mono<OpenAccountResponseDto> processAccountOpeningReactive(CustomerRequest request);
}


