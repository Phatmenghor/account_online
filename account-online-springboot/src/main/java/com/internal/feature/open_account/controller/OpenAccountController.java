package com.internal.feature.open_account.controller;

import com.internal.exceptions.response.ApiResponse;
import com.internal.feature.open_account.dto.request.ApproveAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.request.RejectAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestDto;
import com.internal.feature.open_account.service.OpenAccountService;
import com.internal.utils.constants.ResponseMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
@RestController
@RequestMapping("/api/v1/public/open-account")
@RequiredArgsConstructor
@Slf4j
public class OpenAccountController {
    private final OpenAccountService openAccountService;

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<PendingAccountOpeningRequestDto>> submitAccountOpeningRequest(
            @Valid @RequestBody CustomerRequest request) throws Exception {
        log.info("Received account opening submission for Legal ID: {}", request.getLegalId());

        PendingAccountOpeningRequestDto response = openAccountService.submitAccountOpeningRequest(request);

        log.info("✓ Account opening request submitted for admin review | Request ID: {}", response.getId());
        log.info("  Legal ID: {} | AML Status: {}", response.getLegalId(), response.getAmlStatus());

        return ResponseEntity.ok(ApiResponse.success("Account opening request submitted for admin review", response));
    }

    @PostMapping("/approve")
    public ResponseEntity<ApiResponse<PendingAccountOpeningRequestDto>> approveRequest(
            @Valid @RequestBody ApproveAccountOpeningRequestDto dto) throws Exception {
        log.info("Approving account opening request ID: {}", dto.getRequestId());

        PendingAccountOpeningRequestDto response = openAccountService.approveAccountOpeningRequest(dto);

        log.info("✓ Request approved | Legal ID: {}", response.getLegalId());

        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.ACCOUNT_APPROVED, response));
    }

    @PostMapping("/reject")
    public ResponseEntity<ApiResponse<PendingAccountOpeningRequestDto>> rejectRequest(
            @Valid @RequestBody RejectAccountOpeningRequestDto dto) throws Exception {
        log.info("Rejecting account opening request ID: {}", dto.getRequestId());

        PendingAccountOpeningRequestDto response = openAccountService.rejectAccountOpeningRequest(dto);

        log.info("✓ Request rejected | Legal ID: {}", response.getLegalId());

        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.ACCOUNT_REJECTED, response));
    }
}
