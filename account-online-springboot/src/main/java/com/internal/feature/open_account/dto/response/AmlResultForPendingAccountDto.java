package com.internal.feature.open_account.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.internal.enumation.AmlStatusEnum;
import com.internal.feature.aml.dto.request.CustomerAmlDto;
import com.internal.feature.auth.dto.response.UserResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Clean AML result DTO for pending account responses
 * Contains only AML screening data, no duplicate customer/address fields
 * Kept separate from AmlStatusDto to avoid touching AML module flow
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AmlResultForPendingAccountDto {

    private Long id;

    // CUSTOMER FIELDS (nested customer info)
    private CustomerAmlDto customerInfo;

    // AML SCREENING RESULT
    private AmlStatusEnum status;
    private String screeningResult;

    // AML EXTERNAL SCREENING DATA
    private String riskLevel;
    private String actionTaken;
    private String rulesTriggered;
    private String serviceName;
    private int totalRulesScore;
    private String trxnID;

    // AUDIT FIELDS
    private UserResponseDto approvedBy;
    private UserResponseDto rejectedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // IMAGE REFERENCES ONLY (for audit trail)
    private String nidImageName;
    private String selfieImageName;
}
