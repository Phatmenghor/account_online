package com.internal.feature.aml.repository;

import com.internal.feature.aml.models.JuniorAmlHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface JuniorAmlHistoryRepository extends JpaRepository<JuniorAmlHistory, Long> {

    @Query("SELECT h FROM JuniorAmlHistory h WHERE " +
           "(cast(:status as string) IS NULL OR h.status = :status) AND " +
           "(cast(:fromDate as java.time.LocalDateTime) IS NULL OR h.createdAt >= :fromDate) AND " +
           "(cast(:toDate as java.time.LocalDateTime) IS NULL OR h.createdAt <= :toDate) AND " +
           "(cast(:search as string) IS NULL OR LOWER(h.familyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(h.givenName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(h.lastNameKh) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(h.firstNameKh) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(h.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(h.legalId) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<JuniorAmlHistory> findByStatusAndSearch(
            @Param("status") String status,
            @Param("search") String search,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );
}
