package com.internal.shared.specification;

import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class SpecificationBuilder<T> {

    private final List<SearchCriteria> params;

    public SpecificationBuilder() {
        this.params = new ArrayList<>();
    }

    public SpecificationBuilder<T> with(String key, SearchOperation operation, Object value) {
        if (value != null) {
            params.add(new SearchCriteria(key, value, operation));
        }
        return this;
    }

    public Specification<T> build() {
        if (params.isEmpty()) {
            return null;
        }

        GenericSpecification<T> spec = new GenericSpecification<>();
        for (SearchCriteria param : params) {
            spec.add(param);
        }
        return spec;
    }
}
