package com.internal.feature.open_account.service;

import com.internal.feature.open_account.dto.request.AllPendingAccountHistoryRequestDto;
import com.internal.feature.open_account.dto.request.ApproveAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.request.RejectAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.response.PendingAccountAdminReviewDto;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.response.ReviewHistoryResponseDto;
import com.internal.utils.pagination.PaginationResponse;

public interface OpenAccountService {

    PendingAccountOpeningRequestDto submitAccountOpeningRequest(CustomerRequest request) throws Exception;

    PendingAccountOpeningRequestDto approveAccountOpeningRequest(ApproveAccountOpeningRequestDto dto) throws Exception;

    PendingAccountOpeningRequestDto rejectAccountOpeningRequest(RejectAccountOpeningRequestDto dto) throws Exception;

    PaginationResponse<PendingAccountAdminReviewDto> getAllPendingAccountsHistory(AllPendingAccountHistoryRequestDto request) throws Exception;

    PendingAccountAdminReviewDto getPendingAccountHistoryById(Long requestId) throws Exception;

    ReviewHistoryResponseDto getReviewHistory(Long requestId) throws Exception;

    PaginationResponse<PendingAccountOpeningRequestHistoryDto> getAllOpeningRequestHistory(AllPendingAccountHistoryRequestDto request) throws Exception;
}
