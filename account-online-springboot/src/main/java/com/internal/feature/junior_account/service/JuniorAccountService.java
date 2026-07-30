package com.internal.feature.junior_account.service;

import com.internal.feature.junior_account.dto.request.JuniorCustomerRequest;
import com.internal.feature.junior_account.models.JuniorAccountFinal;
import com.internal.feature.open_account.dto.response.OpenAccountResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import reactor.core.publisher.Mono;

public interface JuniorAccountService {

    OpenAccountResponseDto processJuniorAccountOpening(JuniorCustomerRequest request) throws Exception;

    Mono<OpenAccountResponseDto> processJuniorAccountOpeningReactive(JuniorCustomerRequest request);

    Page<JuniorAccountFinal> getAllJuniorAccountFinals(Pageable pageable);
}
