package com.internal.feature.open_account.service;

import com.internal.feature.open_account.dto.request.ApproveAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.request.RejectAccountOpeningRequestDto;
import com.internal.feature.open_account.dto.response.CustomerResponse;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OpenAccountService {
    CustomerResponse openAccount(CustomerRequest request) throws Exception;

    PendingAccountOpeningRequestDto submitAccountOpeningRequest(CustomerRequest request) throws Exception;

    CustomerResponse completeAccountOpening(Long requestId) throws Exception;

    PendingAccountOpeningRequestDto approveAccountOpeningRequest(ApproveAccountOpeningRequestDto dto) throws Exception;

    PendingAccountOpeningRequestDto rejectAccountOpeningRequest(RejectAccountOpeningRequestDto dto) throws Exception;

    List<PendingAccountOpeningRequestDto> getPendingRequests();

    Page<PendingAccountOpeningRequestDto> getPendingRequests(Pageable pageable);

    PendingAccountOpeningRequestDto getPendingRequest(Long requestId) throws Exception;
}
