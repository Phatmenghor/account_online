package com.internal.shared.core.service.impl;

import com.internal.shared.core.service.BaseService;
import com.internal.shared.exception.custom.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Generic BaseServiceImpl providing transactional CRUD methods for Spring Data JPA repositories.
 *
 * @param <T>  Entity type
 * @param <ID> Entity identifier type
 * @param <R>  Repository type extending JpaRepository & JpaSpecificationExecutor
 */
@RequiredArgsConstructor
@Transactional(readOnly = true)
public abstract class BaseServiceImpl<T, ID, R extends JpaRepository<T, ID> & JpaSpecificationExecutor<T>> implements BaseService<T, ID> {

    protected final R repository;

    @Override
    public List<T> findAll() {
        return repository.findAll();
    }

    @Override
    public Page<T> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Override
    public Page<T> findAll(Specification<T> spec, Pageable pageable) {
        return repository.findAll(spec, pageable);
    }

    @Override
    public Optional<T> findById(ID id) {
        return repository.findById(id);
    }

    @Override
    public T getById(ID id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Resource not found with id: " + id));
    }

    @Override
    @Transactional
    public T save(T entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public List<T> saveAll(Iterable<T> entities) {
        return repository.saveAll(entities);
    }

    @Override
    @Transactional
    public void deleteById(ID id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Cannot delete. Resource not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public boolean existsById(ID id) {
        return repository.existsById(id);
    }
}
