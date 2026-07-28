package com.internal.feature.open_account.repository;

import com.internal.feature.open_account.models.AccountOnlineFinal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountOnlineFinalRepository extends JpaRepository<AccountOnlineFinal, UUID> {

        Optional<AccountOnlineFinal> findByLegalId(String legalId);

        Optional<AccountOnlineFinal> findTopByCifOrLegalIdOrderByCreatedAtDesc(String cif, String legalId);

        @Query("SELECT FUNCTION('DATE', a.createdAt), COUNT(a) FROM AccountOnlineFinal a WHERE a.createdAt >= :startDate AND a.createdAt < :endDate GROUP BY FUNCTION('DATE', a.createdAt)")
        List<Object[]> countByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

        @Query("SELECT a.submittedBy AS username, COUNT(a) AS totalAccounts FROM AccountOnlineFinal a GROUP BY a.submittedBy ORDER BY COUNT(a) DESC")
        List<Object[]> findTopUsersByAccountCount();

        @Query("SELECT a.legalGender, COUNT(a) FROM AccountOnlineFinal a " +
                        "WHERE (:startDate IS NULL OR a.createdAt >= :startDate) " +
                        "AND (:endDate IS NULL OR a.createdAt <= :endDate) " +
                        "GROUP BY a.legalGender")
        List<Object[]> countGenderStats(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query("SELECT a FROM AccountOnlineFinal a WHERE " +
                        "(:startDate IS NULL OR a.createdAt >= :startDate) AND " +
                        "(:endDate IS NULL OR a.createdAt <= :endDate) AND " +
                        "(:search IS NULL OR :search = '' OR " +
                        " LOWER(a.legalFirstNameEn) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        " LOWER(a.legalLastNameEn) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        " LOWER(a.legalId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        " LOWER(a.cif) LIKE LOWER(CONCAT('%', :search, '%')))")
        Page<AccountOnlineFinal> findBySearch(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("search") String search,
                        Pageable pageable);

        @Query("SELECT a FROM AccountOnlineFinal a WHERE " +
                        "(:startDate IS NULL OR a.createdAt >= :startDate) AND " +
                        "(:endDate IS NULL OR a.createdAt <= :endDate) AND " +
                        "(:search IS NULL OR :search = '' OR " +
                        " LOWER(a.legalFirstNameEn) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        " LOWER(a.legalLastNameEn) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        " LOWER(a.legalId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        " LOWER(a.cif) LIKE LOWER(CONCAT('%', :search, '%')))")
        List<AccountOnlineFinal> findBySearchExcel(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("search") String search);
}
