package com.internal.shared.pagination;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

public class PaginationUtil {

    private PaginationUtil() {}

    public static Pageable createPageable(BasePaginationFilterRequest request) {
        if (request == null) {
            return PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        Sort.Direction direction = "ASC".equalsIgnoreCase(request.getValidatedSortDirection()) 
                ? Sort.Direction.ASC 
                : Sort.Direction.DESC;
        return PageRequest.of(
                request.getValidatedPageNo(), 
                request.getValidatedPageSize(), 
                Sort.by(direction, request.getValidatedSortBy())
        );
    }

    public static Pageable createPageable(int pageNo, int pageSize, String sortBy, String sortDirection) {
        int page = pageNo > 0 ? pageNo - 1 : 0;
        int size = pageSize > 0 ? pageSize : 10;
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String field = (sortBy == null || sortBy.isBlank()) ? "createdAt" : sortBy;
        return PageRequest.of(page, size, Sort.by(direction, field));
    }

    public static <T, R> PaginationResponse<R> toPaginationResponse(Page<T> page, Function<T, R> mapper) {
        List<R> content = page.getContent().stream()
                .map(mapper)
                .collect(Collectors.toList());
        return new PaginationResponse<>(
                content,
                page.getNumber() + 1,
                page.getSize(),
                page.getTotalElements()
        );
    }

    public static <T> PaginationResponse<T> toPaginationResponse(Page<T> page) {
        return new PaginationResponse<>(
                page.getContent(),
                page.getNumber() + 1,
                page.getSize(),
                page.getTotalElements()
        );
    }
}
