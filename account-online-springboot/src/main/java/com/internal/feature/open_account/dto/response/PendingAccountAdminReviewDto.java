package com.internal.feature.open_account.dto.response;

import com.internal.enumation.AccountOpeningRequestStatusEnum;
import com.internal.enumation.AmlStatusEnum;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PendingAccountAdminReviewDto {

    // Request metadata
    private Long requestId;
    private String legalId;
    private AccountOpeningRequestStatusEnum status;
    private String createdAt;

    // AML information
    private AmlStatusEnum amlStatus;
    private String amlResultData;

    // Review remarks
    private String remark;

    // Complete customer data (raw JSON from request)
    private String requestData;

    // Customer info JSON
    private String customerInfo;
}
