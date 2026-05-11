package com.internal.feature.open_account.dto.response;

import com.internal.enumation.AccountOpeningRequestStatusEnum;
import com.internal.enumation.AmlStatusEnum;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PendingAccountOpeningRequestDto {

    // Request metadata
    private Long id;
    private String legalId;
    private AccountOpeningRequestStatusEnum status;
    private String createdAt;
    private String message;
    private String remark;

    // AML information
    private AmlStatusEnum amlStatus;
    private String amlResultData;

    // Complete customer data (raw JSON from request)
    private String requestData;

    // AML raw data
    private String customerInfo;
}
