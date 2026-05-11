package com.internal.feature.open_account.dto.response;

import com.internal.enumation.AccountOpeningRequestStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingAccountOpeningRequestHistoryDto {

    private Long id;
    private Long requestId;
    private String legalId;
    private AccountOpeningRequestStatusEnum status;
    private String actionUsername;
    private String remark;
    private String createdAt;
}
