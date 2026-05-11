package com.internal.feature.open_account.service;

import com.internal.feature.open_account.dto.request.AllPendingAccountHistoryRequestDto;
import com.internal.feature.open_account.dto.request.ApproveAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.request.RejectAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.response.AllPendingAccountOpeningHistoryResponseDto;
import com.internal.feature.open_account.dto.response.CustomerResponse;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningHistoryDto;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestHistoryDto;
import com.internal.utils.pagination.PaginationResponse;

import java.util.List;

public interface OpenAccountService {
    CustomerResponse openAccount(CustomerRequest request) throws Exception;

    PendingAccountOpeningRequestDto submitAccountOpeningRequest(CustomerRequest request) throws Exception;

    CustomerResponse completeAccountOpening(Long requestId) throws Exception;

    PendingAccountOpeningRequestDto approveAccountOpeningRequest(ApproveAccountOpeningRequestDto dto) throws Exception;

    PendingAccountOpeningRequestDto rejectAccountOpeningRequest(RejectAccountOpeningRequestDto dto) throws Exception;

    List<PendingAccountOpeningRequestDto> getPendingRequests();

    PaginationResponse<PendingAccountOpeningRequestDto> getPendingRequests(int pageNo, int pageSize, String sortBy, String sortDirection) throws Exception;

    PendingAccountOpeningRequestDto getPendingRequest(Long requestId) throws Exception;

    AllPendingAccountOpeningHistoryResponseDto getAllPendingAccountsHistory(AllPendingAccountHistoryRequestDto request) throws Exception;

    PendingAccountOpeningHistoryDto getPendingAccountHistoryById(Long requestId) throws Exception;
}
