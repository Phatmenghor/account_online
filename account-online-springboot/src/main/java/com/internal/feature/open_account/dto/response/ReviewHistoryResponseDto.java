package com.internal.feature.open_account.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewHistoryResponseDto {

    private Long requestId;
    private String legalId;
    private List<PendingAccountOpeningRequestHistoryDto> history;
}
