package com.internal.feature.open_account.controller;

import com.internal.exceptions.response.ApiResponse;
import com.internal.feature.open_account.dto.request.AllPendingAccountHistoryRequestDto;
import com.internal.feature.open_account.dto.response.AllPendingAccountOpeningHistoryResponseDto;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningHistoryDto;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestDto;
import com.internal.feature.open_account.service.OpenAccountService;
import com.internal.utils.constants.ResponseMessage;
import com.internal.utils.pagination.PaginationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin/open-account")
@RequiredArgsConstructor
@Slf4j
public class AdminOpenAccountController {
    private final OpenAccountService openAccountService;

    @PostMapping("/all-history")
    public ResponseEntity<ApiResponse<AllPendingAccountOpeningHistoryResponseDto>> getAllHistory(
            @Valid @RequestBody AllPendingAccountHistoryRequestDto request) throws Exception {
        log.info("Fetching all pending accounts history with search: {}", request.getSearch());

        AllPendingAccountOpeningHistoryResponseDto response = openAccountService.getAllPendingAccountsHistory(request);

        log.info("✓ Found {} pending accounts | Total: {}", response.getContent().size(), response.getTotalElements());

        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.PENDING_ACCOUNTS_RETRIEVED, response));
    }

    @PostMapping("/history-by-id/{requestId}")
    public ResponseEntity<ApiResponse<PendingAccountOpeningHistoryDto>> getHistoryById(@PathVariable Long requestId) throws Exception {
        log.info("Fetching history for request ID: {}", requestId);

        PendingAccountOpeningHistoryDto response = openAccountService.getPendingAccountHistoryById(requestId);

        log.info("✓ History retrieved | Request ID: {}", requestId);

        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.PENDING_ACCOUNT_HISTORY_RETRIEVED, response));
    }
}
