package com.internal.feature.open_account.controller;

import com.internal.exceptions.response.ApiResponse;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestDto;
import com.internal.feature.open_account.service.OpenAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    public ResponseEntity<ApiResponse<List<PendingAccountOpeningRequestDto>>> listPendingRequests() {
        log.info("Fetching all pending account opening requests");

        List<PendingAccountOpeningRequestDto> response = openAccountService.getPendingRequests();

        log.info("✓ Found {} pending requests", response.size());

        return ResponseEntity.ok(ApiResponse.success("Pending requests retrieved successfully", response));
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<PendingAccountOpeningRequestDto>> getPendingRequest(@PathVariable Long requestId) throws Exception {
        log.info("Fetching pending request ID: {}", requestId);

        PendingAccountOpeningRequestDto response = openAccountService.getPendingRequest(requestId);

        log.info("✓ Request retrieved | Request ID: {}", requestId);

        return ResponseEntity.ok(ApiResponse.success("Request retrieved successfully", response));
    }
}
