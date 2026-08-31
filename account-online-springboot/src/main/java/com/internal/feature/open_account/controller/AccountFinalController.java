package com.internal.feature.open_account.controller;

import com.internal.feature.open_account.dto.request.AccountOnlineFinalLogRequestDto;
import com.internal.feature.open_account.dto.request.AllAccountOnlineSuccessExcelRequestDto;
import com.internal.feature.open_account.dto.request.AllAccountOnlineSuccessRequestDto;
import com.internal.feature.open_account.dto.response.AccountOnlineFinalExcelResponseDto;
import com.internal.feature.open_account.dto.response.AccountOnlineFinalResponseDto;
import com.internal.feature.open_account.dto.response.AllAccountOnlineFinalExcelResponseDto;
import com.internal.feature.open_account.dto.response.AllAccountOnlineFinalResponseDto;
import com.internal.feature.open_account.service.AccountFinalService;
import com.internal.shared.constant.ResponseMessage;
import com.internal.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/account-online-final")
@RequiredArgsConstructor
@Slf4j
public class AccountFinalController {

    private final AccountFinalService accountFinalService;

    @PostMapping()
    public ResponseEntity<ApiResponse<AccountOnlineFinalResponseDto>> getAccountByCifOrLegalId(@Valid @RequestBody AccountOnlineFinalLogRequestDto request) {
        log.info("[AccountFinalController] Fetching Account by cif={}, legalId={}", request.getCif(), request.getLegalId());
        AccountOnlineFinalResponseDto dto = accountFinalService.findAccountByCifOrLegalId(request);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.ACCOUNT_RETRIEVED, dto));
    }

    @PostMapping("/success-list")
    public ResponseEntity<ApiResponse<AllAccountOnlineFinalResponseDto>> getSuccessOpenAccounts(@Valid @RequestBody AllAccountOnlineSuccessRequestDto request) {
        log.info("[AccountFinalController] Fetching success open accounts. page={}, size={}, search={}",
                request.getPageNo(), request.getPageSize(), request.getSearch());
        AllAccountOnlineFinalResponseDto response = accountFinalService.getSuccessOpenAccount(request);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.SUCCESS_ACCOUNTS_RETRIEVED, response));
    }

    @PostMapping("/success-list/excel")
    public ResponseEntity<ApiResponse<AllAccountOnlineFinalExcelResponseDto>> getSuccessOpenAccountExcels(@Valid @RequestBody AllAccountOnlineSuccessExcelRequestDto request) {
        log.info("[AccountFinalController] Fetching success open accounts excel report. fromDate={}, toDate={}, search={}",
                request.getFromDate(), request.getToDate(), request.getSearch());
        AllAccountOnlineFinalExcelResponseDto response = accountFinalService.getSuccessOpenAccountExcel(request);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.SUCCESS_ACCOUNTS_RETRIEVED, response));
    }
}
