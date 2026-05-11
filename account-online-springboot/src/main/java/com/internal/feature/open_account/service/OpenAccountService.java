package com.internal.feature.open_account.service;

import com.internal.feature.open_account.dto.request.AllPendingAccountHistoryRequestDto;
import com.internal.feature.open_account.dto.request.ApproveAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.request.RejectAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.response.AllPendingAccountOpeningHistoryResponseDto;
import com.internal.feature.open_account.dto.response.PendingAccountAdminReviewDto;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningHistoryDto;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.response.ReviewHistoryResponseDto;

public interface OpenAccountService {

    PendingAccountOpeningRequestDto submitAccountOpeningRequest(CustomerRequest request) throws Exception;

    PendingAccountOpeningRequestDto approveAccountOpeningRequest(ApproveAccountOpeningRequestDto dto) throws Exception;

    PendingAccountOpeningRequestDto rejectAccountOpeningRequest(RejectAccountOpeningRequestDto dto) throws Exception;

    AllPendingAccountOpeningHistoryResponseDto getAllPendingAccountsHistory(AllPendingAccountHistoryRequestDto request) throws Exception;

    PendingAccountAdminReviewDto getPendingAccountHistoryById(Long requestId) throws Exception;

    ReviewHistoryResponseDto getReviewHistory(Long requestId) throws Exception;
}
