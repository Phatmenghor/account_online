package com.internal.shared.core.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;

/**
 * Generic Service interface providing enterprise CRUD and querying operations.
 *
 * @param <T>  Entity type
 * @param <ID> Entity identifier type
 */
public interface BaseService<T, ID> {

    List<T> findAll();

    Page<T> findAll(Pageable pageable);

    Page<T> findAll(Specification<T> spec, Pageable pageable);

    Optional<T> findById(ID id);

    T getById(ID id);

    T save(T entity);

    List<T> saveAll(Iterable<T> entities);

    void deleteById(ID id);

    boolean existsById(ID id);
}
