package com.internal.feature.junior_account.service;

import com.internal.feature.junior_account.dto.request.JuniorCustomerRequest;
import com.internal.feature.open_account.dto.response.OpenAccountResponseDto;
import reactor.core.publisher.Mono;

public interface JuniorAccountService {

    OpenAccountResponseDto processJuniorAccountOpening(JuniorCustomerRequest request) throws Exception;

    Mono<OpenAccountResponseDto> processJuniorAccountOpeningReactive(JuniorCustomerRequest request);
}
