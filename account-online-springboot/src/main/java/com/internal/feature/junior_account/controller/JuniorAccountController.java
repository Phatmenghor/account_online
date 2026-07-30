package com.internal.feature.junior_account.controller;

import com.internal.feature.aml.dto.request.AllAmlRequestDto;
import com.internal.feature.aml.models.JuniorAmlStatus;
import com.internal.feature.aml.service.JuniorAmlService;
import com.internal.feature.junior_account.dto.request.CustomerInfoRequestDto;
import com.internal.feature.junior_account.dto.request.JuniorCustomerRequest;
import com.internal.feature.junior_account.dto.response.CustomerInfoResponse;
import com.internal.feature.junior_account.models.JuniorAccountFinal;
import com.internal.feature.junior_account.service.CustomerInfoService;
import com.internal.feature.junior_account.service.JuniorAccountService;
import com.internal.feature.open_account.dto.request.AllAccountOnlineSuccessRequestDto;
import com.internal.feature.open_account.dto.response.OpenAccountResponseDto;
import com.internal.shared.pagination.PaginationUtil;
import com.internal.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@Slf4j
public class JuniorAccountController {

    private final JuniorAccountService juniorAccountService;
    private final JuniorAmlService juniorAmlService;
    private final CustomerInfoService customerInfoService;

    @PostMapping("/api/v1/public/junior-open-account/customer-info")
    public ResponseEntity<ApiResponse<CustomerInfoResponse>> getCustomerInfoByCif(
            @Valid @RequestBody CustomerInfoRequestDto request) {
        log.info("API: Customer info request for CIF: {}", request.getCif());
        CustomerInfoResponse response = customerInfoService.getCustomerByCif(request.getCif());
        return ResponseEntity.ok(ApiResponse.success("Customer info retrieved successfully", response));
    }

    @PostMapping("/api/v1/public/junior-open-account/process")
    public Mono<ResponseEntity<ApiResponse<OpenAccountResponseDto>>> processJuniorAccountOpening(
            @Valid @RequestBody JuniorCustomerRequest request) {
        log.info("Received Public Junior Account Opening request | Has NID: {} | Legal ID: {}",
                request.getHasNid(), request.getLegalId());

        String traceId = org.slf4j.MDC.get("traceId");

        return juniorAccountService.processJuniorAccountOpeningReactive(request)
                .map(response -> {
                    if (traceId != null) org.slf4j.MDC.put("traceId", traceId);
                    try {
                        log.info("Junior Account opened successfully | Legal ID: {} | CIF: {}",
                                response.getLegalId(), response.getCif());
                        return ResponseEntity.ok(ApiResponse.success("Junior Account opened successfully", response));
                    } finally {
                        org.slf4j.MDC.clear();
                    }
                });
    }

    @PostMapping("/api/v1/junior-account/all-final")
    public ResponseEntity<ApiResponse<Page<JuniorAccountFinal>>> getAllJuniorAccountFinals(
            @Valid @RequestBody AllAccountOnlineSuccessRequestDto request) {
        log.info("Fetching Junior Account Final records with search: {}", request.getSearch());
        Pageable pageable = PaginationUtil.createPageable(request);
        Page<JuniorAccountFinal> page = juniorAccountService.getAllJuniorAccountFinals(pageable);
        return ResponseEntity.ok(ApiResponse.success("Junior account records retrieved", page));
    }

    @PostMapping("/api/v1/junior-account/all-aml")
    public ResponseEntity<ApiResponse<Page<JuniorAmlStatus>>> getAllJuniorAmlStatuses(
            @Valid @RequestBody AllAmlRequestDto request) {
        log.info("Fetching Junior AML status records with search: {}", request.getSearch());
        Pageable pageable = PaginationUtil.createPageable(request);
        Page<JuniorAmlStatus> page = juniorAmlService.getAllJuniorAmlStatus(
                request.getAmlStatusString(), request.getSearch(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Junior AML status records retrieved", page));
    }
}
