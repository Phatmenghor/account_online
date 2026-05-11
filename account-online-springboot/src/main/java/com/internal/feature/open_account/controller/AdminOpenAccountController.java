package com.internal.feature.open_account.controller;

import com.internal.exceptions.response.ApiResponse;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestHistoryDto;
import com.internal.feature.open_account.service.OpenAccountService;
import com.internal.utils.constants.ResponseMessage;
import com.internal.utils.pagination.PaginationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/open-account")
@RequiredArgsConstructor
@Slf4j
public class AdminOpenAccountController {
    private final OpenAccountService openAccountService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginationResponse<PendingAccountOpeningRequestDto>>> listPendingRequests(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) throws Exception {
        log.info("Fetching pending accounts - Page: {}, Size: {}, Sort: {} {}", pageNo, pageSize, sortBy, sortDirection);

        PaginationResponse<PendingAccountOpeningRequestDto> response = openAccountService.getPendingRequests(pageNo, pageSize, sortBy, sortDirection);

        log.info("✓ Found {} pending accounts | Total: {}", response.getContent().size(), response.getTotalElements());

        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.PENDING_ACCOUNTS_RETRIEVED, response));
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<PendingAccountOpeningRequestDto>> getPendingRequest(@PathVariable Long requestId) throws Exception {
        log.info("Fetching pending request ID: {}", requestId);

        PendingAccountOpeningRequestDto response = openAccountService.getPendingRequest(requestId);

        log.info("✓ Request retrieved | Request ID: {}", requestId);

        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.PENDING_ACCOUNT_RETRIEVED, response));
    }

    @GetMapping("/{requestId}/history")
    public ResponseEntity<ApiResponse<PaginationResponse<PendingAccountOpeningRequestHistoryDto>>> getRequestHistory(
            @PathVariable Long requestId,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) throws Exception {
        log.info("Fetching history for request ID: {}", requestId);

        PaginationResponse<PendingAccountOpeningRequestHistoryDto> response = openAccountService.getRequestHistory(requestId, pageNo, pageSize, sortBy, sortDirection);

        log.info("✓ Found {} history records | Total: {}", response.getContent().size(), response.getTotalElements());

        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.PENDING_ACCOUNT_HISTORY_RETRIEVED, response));
    }
}
