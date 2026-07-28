package com.internal.feature.open_account.service;

import com.internal.feature.aml.dto.response.AmlStatusDto;
import com.internal.feature.customer_image.dto.response.CustomerImageUploadResponseDto;
import com.internal.feature.open_account.dto.request.AccountOnlineFinalLogRequestDto;
import com.internal.feature.open_account.dto.request.AllAccountOnlineSuccessExcelRequestDto;
import com.internal.feature.open_account.dto.request.AllAccountOnlineSuccessRequestDto;
import com.internal.feature.open_account.dto.response.AccountOnlineFinalExcelResponseDto;
import com.internal.feature.open_account.dto.response.AccountOnlineFinalResponseDto;
import com.internal.feature.open_account.dto.response.AllAccountOnlineFinalExcelResponseDto;
import com.internal.feature.open_account.dto.response.AllAccountOnlineFinalResponseDto;
import com.internal.feature.open_account.models.AccountOnlineFinal;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.response.CustomerResponse;

public interface AccountFinalService {

    AccountOnlineFinal saveFinalLog(
            CustomerRequest request,
            CustomerResponse accountInfo,
            AmlStatusDto amlProcessResult,
            CustomerImageUploadResponseDto imagePaths,
            String mbActivationCode
    );

    AccountOnlineFinalResponseDto findAccountByCifOrLegalId(AccountOnlineFinalLogRequestDto request);

    AllAccountOnlineFinalResponseDto getSuccessOpenAccount(AllAccountOnlineSuccessRequestDto request);

    AllAccountOnlineFinalExcelResponseDto getSuccessOpenAccountExcel(AllAccountOnlineSuccessExcelRequestDto request);

    void updateFinalLogWithAml(AmlStatusDto amlStatus);
}
