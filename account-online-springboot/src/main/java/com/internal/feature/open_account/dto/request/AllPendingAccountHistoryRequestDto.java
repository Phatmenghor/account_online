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
    private int pageNo = 1;
    private int pageSize = 20;
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";
    private String status;
}
