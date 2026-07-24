package com.internal.shared.specification;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class BaseSpecification {

    protected BaseSpecification() {}

    public static <T> Specification<T> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank()) {
                return cb.conjunction();
            }
            return cb.equal(root.get("status"), status);
        };
    }

    public static <T> Specification<T> hasStatusIn(Collection<?> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) {
                return cb.conjunction();
            }
            return root.get("status").in(statuses);
        };
    }

    public static <T> Specification<T> containsSearch(String search, List<String> fieldNames) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank() || fieldNames == null || fieldNames.isEmpty()) {
                return cb.conjunction();
            }
            String searchPattern = "%" + search.toLowerCase().trim() + "%";
            List<Predicate> predicates = new ArrayList<>();
            for (String field : fieldNames) {
                predicates.add(cb.like(cb.lower(root.get(field)), searchPattern));
            }
            return cb.or(predicates.toArray(new Predicate[0]));
        };
    }

    public static <T> Specification<T> createdBetween(LocalDateTime fromDate, LocalDateTime toDate) {
        return (root, query, cb) -> {
            if (fromDate == null && toDate == null) {
                return cb.conjunction();
            }
            if (fromDate != null && toDate != null) {
                return cb.between(root.get("createdAt"), fromDate, toDate);
            }
            if (fromDate != null) {
                return cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate);
            }
            return cb.lessThanOrEqualTo(root.get("createdAt"), toDate);
        };
    }
}
