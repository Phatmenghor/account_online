package com.internal.feature.open_account.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllPendingAccountHistoryRequestDto {

    private String search;
    @Builder.Default
    private int pageNo = 1;
    @Builder.Default
    private int pageSize = 20;
    @Builder.Default
    private String sortBy = "createdAt";
    @Builder.Default
    private String sortDirection = "DESC";
    private String status;
}
