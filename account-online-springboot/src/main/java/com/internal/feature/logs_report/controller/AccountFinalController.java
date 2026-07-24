package com.internal.feature.logs_report.controller;

import com.internal.feature.logs_report.dto.request.AccountOnlineFinalLogRequestDto;
import com.internal.feature.logs_report.dto.request.AllAccountOnlineSuccessExcelRequestDto;
import com.internal.feature.logs_report.dto.request.AllAccountOnlineSuccessRequestDto;
import com.internal.feature.logs_report.dto.response.AccountOnlineFinalExcelResponseDto;
import com.internal.feature.logs_report.dto.response.AccountOnlineFinalResponseDto;
import com.internal.feature.logs_report.dto.response.AllAccountOnlineFinalExcelResponseDto;
import com.internal.feature.logs_report.dto.response.AllAccountOnlineFinalResponseDto;
import com.internal.feature.logs_report.service.AccountFinalService;
import com.internal.shared.constant.ResponseMessage;
import com.internal.shared.response.ApiResponse;
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
    public ResponseEntity<ApiResponse<AccountOnlineFinalResponseDto>> getAccountByCifOrLegalId(@RequestBody AccountOnlineFinalLogRequestDto request) {
        log.info("Fetching Account By CIF: {} , Legal Id: {}", request.getCif(), request.getLegalId());
        AccountOnlineFinalResponseDto dto = accountFinalService.findAccountByCifOrLegalId(request);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.ACCOUNT_RETRIEVED, dto));
    }

    @PostMapping("/success-list")
    public ResponseEntity<ApiResponse<AllAccountOnlineFinalResponseDto>> getSuccessOpenAccounts(@RequestBody AllAccountOnlineSuccessRequestDto request) {
        log.info("Fetching success open accounts - Page: {}, Size: {}, Search: {}",
                request.getPageNo(), request.getPageSize(), request.getSearch());
        AllAccountOnlineFinalResponseDto response = accountFinalService.getSuccessOpenAccount(request);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.SUCCESS_ACCOUNTS_RETRIEVED, response));
    }

    @PostMapping("/success-list/excel")
    public ResponseEntity<ApiResponse<AllAccountOnlineFinalExcelResponseDto>> getSuccessOpenAccountExcels(@RequestBody AllAccountOnlineSuccessExcelRequestDto request) {
        log.info("Fetching success open accounts report excel - from: {}, to: {}, Search: {}",
                request.getFromDate(), request.getToDate(), request.getSearch());
        AllAccountOnlineFinalExcelResponseDto response = accountFinalService.getSuccessOpenAccountExcel(request);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.SUCCESS_ACCOUNTS_RETRIEVED, response));
    }
}
