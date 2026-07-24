package com.internal.feature.open_account.controller;

import com.internal.shared.response.ApiResponse;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.response.OpenAccountResponseDto;
import com.internal.feature.open_account.service.OpenAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import reactor.core.publisher.Mono;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/open-account")
@RequiredArgsConstructor
@Slf4j
public class OpenAccountController {

    private final OpenAccountService openAccountService;

    @PostMapping("/process")
    public Mono<ResponseEntity<ApiResponse<OpenAccountResponseDto>>> processAccountOpening(
            @Valid @RequestBody CustomerRequest request) {
        log.info("Received account opening request | Legal ID: {}", request.getLegalId());

        return openAccountService.processAccountOpeningReactive(request)
                .map(response -> {
                    log.info("Account opened successfully | Legal ID: {} | CIF: {} | By: {}",
                            response.getLegalId(), response.getCif(), response.getSubmittedBy());
                    return ResponseEntity.ok(ApiResponse.success("Account opened successfully", response));
                });
    }
}





