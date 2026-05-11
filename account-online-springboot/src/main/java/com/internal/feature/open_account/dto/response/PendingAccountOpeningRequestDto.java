package com.internal.feature.open_account.dto.response;

import com.internal.enumation.AccountOpeningRequestStatusEnum;
import com.internal.enumation.AmlStatusEnum;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.JsonNode;
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

    @JsonRawValue
    private String amlResultData;

    // Complete customer data (parsed JSON object)
    private Object requestData;

    // Customer info JSON
    private Object customerInfo;
}
