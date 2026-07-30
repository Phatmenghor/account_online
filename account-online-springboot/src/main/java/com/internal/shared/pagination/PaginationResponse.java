package com.internal.shared.pagination;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginationResponse<T> {
    private List<T> content;
    private int pageNo;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;

    public PaginationResponse(List<T> content, int pageNo, int pageSize, long totalElements) {
        this.content = content;
        this.pageNo = pageNo;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
        this.totalPages = (pageSize > 0) ? (int) Math.ceil((double) totalElements / pageSize) : 0;
        this.last = (pageNo >= totalPages);
    }

    public static <T> PaginationResponse<T> fromPage(Page<T> page) {
        if (page == null) {
            return new PaginationResponse<>();
        }
        return PaginationResponse.<T>builder()
                .content(page.getContent())
                .pageNo(page.getNumber() + 1)
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
