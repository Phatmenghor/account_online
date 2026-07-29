package com.internal.feature.aml.repository;

import com.internal.feature.aml.models.JuniorAmlStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JuniorAmlStatusRepository extends JpaRepository<JuniorAmlStatus, Long>, JpaSpecificationExecutor<JuniorAmlStatus> {

    Optional<JuniorAmlStatus> findByLegalId(String legalId);

    @Query("SELECT j FROM JuniorAmlStatus j WHERE " +
           "(cast(:status as string) IS NULL OR j.status = :status) AND " +
           "(cast(:search as string) IS NULL OR LOWER(j.legalId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.familyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.givenName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.guardianLegalId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.guardianName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<JuniorAmlStatus> findByStatusAndSearch(
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable
    );
}
