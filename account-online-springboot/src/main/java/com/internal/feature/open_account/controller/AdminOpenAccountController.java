package com.internal.feature.open_account.controller;

import com.internal.exceptions.response.ApiResponse;
import com.internal.feature.open_account.dto.request.AllPendingAccountHistoryRequestDto;
import com.internal.feature.open_account.dto.response.PendingAccountAdminReviewDto;
import com.internal.feature.open_account.dto.response.ReviewHistoryResponseDto;
import com.internal.feature.open_account.service.OpenAccountService;
import com.internal.utils.constants.AppConstants;
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
    public ResponseEntity<ApiResponse<PaginationResponse<PendingAccountAdminReviewDto>>> getAllHistory(
            @Valid @RequestBody AllPendingAccountHistoryRequestDto request) throws Exception {
        log.info("Fetching all pending accounts history with search: {}", request.getSearch());

        PaginationResponse<PendingAccountAdminReviewDto> response = openAccountService.getAllPendingAccountsHistory(request);

        log.info("✓ Found {} pending accounts | Total: {}", response.getContent().size(), response.getTotalElements());

        return ResponseEntity.ok(ApiResponse.success(AppConstants.PENDING_ACCOUNTS_RETRIEVED, response));
    }

    @PostMapping("/history-by-id/{requestId}")
    public ResponseEntity<ApiResponse<PendingAccountAdminReviewDto>> getHistoryById(@PathVariable Long requestId) throws Exception {
        log.info("Fetching admin review details for request ID: {}", requestId);

        PendingAccountAdminReviewDto response = openAccountService.getPendingAccountHistoryById(requestId);

        log.info("✓ Admin review details retrieved | Request ID: {} | Status: {}", requestId, response.getStatus());

        return ResponseEntity.ok(ApiResponse.success(AppConstants.PENDING_ACCOUNT_DETAIL_RETRIEVED, response));
    }

    @GetMapping("/review-history/{requestId}")
    public ResponseEntity<ApiResponse<ReviewHistoryResponseDto>> getReviewHistory(@PathVariable Long requestId) throws Exception {
        log.info("Fetching review history for request ID: {}", requestId);

        ReviewHistoryResponseDto response = openAccountService.getReviewHistory(requestId);

        log.info("✓ Review history retrieved | Request ID: {} | Total records: {}", requestId, response.getHistory().size());

        return ResponseEntity.ok(ApiResponse.success(AppConstants.PENDING_ACCOUNT_DETAIL_RETRIEVED, response));
    }
}
