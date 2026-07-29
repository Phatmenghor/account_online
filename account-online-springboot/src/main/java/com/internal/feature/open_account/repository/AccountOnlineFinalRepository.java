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

        @Query("SELECT a FROM AccountOnlineFinal a WHERE a.legalId = :legalId ORDER BY a.createdAt DESC LIMIT 1")
        Optional<AccountOnlineFinal> findByLegalId(@Param("legalId") String legalId);

        Optional<AccountOnlineFinal> findTopByCifOrLegalIdOrderByCreatedAtDesc(String cif, String legalId);

        @Query("SELECT FUNCTION('DATE', a.createdAt), COUNT(a) FROM AccountOnlineFinal a WHERE a.createdAt >= :startDate AND a.createdAt < :endDate GROUP BY FUNCTION('DATE', a.createdAt)")
        List<Object[]> countByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

        @Query(value =
                "SELECT u.id, COALESCE(u.full_name, a.submitted_by) AS full_name, u.position, u.profile_url, u.branch, COUNT(a.id) AS total_accounts " +
                "FROM acc_online_open_final a " +
                "LEFT JOIN acc_online_users u ON a.submitted_by_user_id = u.id " +
                "GROUP BY u.id, u.full_name, a.submitted_by, u.position, u.profile_url, u.branch " +
                "ORDER BY COUNT(a.id) DESC", nativeQuery = true)
        List<Object[]> findTopUsersByAccountCount();

        @Query("SELECT a.legalGender, COUNT(a) FROM AccountOnlineFinal a " +
                        "WHERE (cast(:startDate as java.time.LocalDateTime) IS NULL OR a.createdAt >= :startDate) " +
                        "AND (cast(:endDate as java.time.LocalDateTime) IS NULL OR a.createdAt <= :endDate) " +
                        "GROUP BY a.legalGender")
        List<Object[]> countGenderStats(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query("SELECT a FROM AccountOnlineFinal a WHERE " +
                        "(cast(:startDate as java.time.LocalDateTime) IS NULL OR a.createdAt >= :startDate) AND " +
                        "(cast(:endDate as java.time.LocalDateTime) IS NULL OR a.createdAt <= :endDate) AND " +
                        "(cast(:search as string) IS NULL OR cast(:search as string) = '' OR " +
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
                        "(cast(:startDate as java.time.LocalDateTime) IS NULL OR a.createdAt >= :startDate) AND " +
                        "(cast(:endDate as java.time.LocalDateTime) IS NULL OR a.createdAt <= :endDate) AND " +
                        "(cast(:search as string) IS NULL OR cast(:search as string) = '' OR " +
                        " LOWER(a.legalFirstNameEn) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        " LOWER(a.legalLastNameEn) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        " LOWER(a.legalId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        " LOWER(a.cif) LIKE LOWER(CONCAT('%', :search, '%')))")
        List<AccountOnlineFinal> findBySearchExcel(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("search") String search);
}
