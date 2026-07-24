package com.internal.shared.pagination;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class BasePaginationFilterRequest {

    @Builder.Default
    private Integer pageNo = 1;

    @Builder.Default
    private Integer pageSize = 10;

    private String search;
    private String status;

    @Builder.Default
    private String sortBy = "createdAt";

    @Builder.Default
    private String sortDirection = "DESC";

    public int getValidatedPageNo() {
        return (pageNo == null || pageNo < 1) ? 0 : pageNo - 1;
    }

    public int getValidatedPageSize() {
        return (pageSize == null || pageSize < 1) ? 10 : pageSize;
    }

    public String getValidatedSortBy() {
        return (sortBy == null || sortBy.isBlank()) ? "createdAt" : sortBy;
    }

    public String getValidatedSortDirection() {
        return (sortDirection == null || sortDirection.isBlank()) ? "DESC" : sortDirection.toUpperCase();
    }
}
