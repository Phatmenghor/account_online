package com.internal.feature.open_account.controller;

import com.internal.exceptions.response.ApiResponse;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestHistoryDto;
import com.internal.feature.open_account.service.OpenAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/open-account")
@RequiredArgsConstructor
@Slf4j
public class AdminOpenAccountController {
    private final OpenAccountService openAccountService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PendingAccountOpeningRequestDto>>> listPendingRequests(Pageable pageable) {
        log.info("Fetching pending account opening requests - Page: {}, Size: {}", pageable.getPageNumber(), pageable.getPageSize());

        Page<PendingAccountOpeningRequestDto> response = openAccountService.getPendingRequests(pageable);

        log.info("✓ Found {} pending requests | Total: {}", response.getNumberOfElements(), response.getTotalElements());

        return ResponseEntity.ok(ApiResponse.success("Pending requests retrieved successfully", response));
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<PendingAccountOpeningRequestDto>> getPendingRequest(@PathVariable Long requestId) throws Exception {
        log.info("Fetching pending request ID: {}", requestId);

        PendingAccountOpeningRequestDto response = openAccountService.getPendingRequest(requestId);

        log.info("✓ Request retrieved | Request ID: {}", requestId);

        return ResponseEntity.ok(ApiResponse.success("Request retrieved successfully", response));
    }

    @GetMapping("/{requestId}/history")
    public ResponseEntity<ApiResponse<Page<PendingAccountOpeningRequestHistoryDto>>> getRequestHistory(
            @PathVariable Long requestId, Pageable pageable) throws Exception {
        log.info("Fetching history for request ID: {}", requestId);

        Page<PendingAccountOpeningRequestHistoryDto> response = openAccountService.getRequestHistory(requestId, pageable);

        log.info("✓ Found {} history records | Total: {}", response.getNumberOfElements(), response.getTotalElements());

        return ResponseEntity.ok(ApiResponse.success("Request history retrieved successfully", response));
    }
}
