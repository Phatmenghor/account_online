package com.internal.feature.open_account.controller;

import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.response.OpenAccountResponseDto;
import com.internal.feature.open_account.service.OpenAccountService;
import com.internal.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Slf4j
public class OpenAccountController {

    private final OpenAccountService openAccountService;

    @PostMapping({"/api/v1/open-account/process", "/api/v1/public/open-account/process"})
    public Mono<ResponseEntity<ApiResponse<OpenAccountResponseDto>>> processAccountOpening(
            @Valid @RequestBody CustomerRequest request) {
        log.info("Received Standard Account Opening request | Legal ID: {}", request.getLegalId());

        String traceId = org.slf4j.MDC.get("traceId");

        return openAccountService.processAccountOpeningReactive(request)
                .map(response -> {
                    if (traceId != null) org.slf4j.MDC.put("traceId", traceId);
                    try {
                        log.info("Standard Account opened successfully | Legal ID: {} | CIF: {} | By: {}",
                                response.getLegalId(), response.getCif(), response.getSubmittedBy());
                        return ResponseEntity.ok(ApiResponse.success("Account opened successfully", response));
                    } finally {
                        org.slf4j.MDC.clear();
                    }
                });
    }
}
