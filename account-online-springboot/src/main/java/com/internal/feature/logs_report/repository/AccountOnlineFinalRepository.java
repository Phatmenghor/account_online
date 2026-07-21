package com.internal.feature.logs_report.repository;

import com.internal.feature.logs_report.models.AccountOnlineFinal;
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

        @Query("SELECT a.legalGender, COUNT(a) FROM AccountOnlineFinal a " +
                        "WHERE a.createdAt >= :startDate AND a.createdAt < :endDate " +
                        "GROUP BY a.legalGender")
        List<Object[]> countByGenderAndDateRange(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query("SELECT a FROM AccountOnlineFinal a WHERE " +
                        "(:search IS NULL OR :search = '' OR " +
                        "LOWER(a.cif) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                        "LOWER(a.legalId) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                        "AND (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR a.createdAt >= :fromDate) " +
                        "AND (CAST(:toDate AS java.time.LocalDateTime) IS NULL OR a.createdAt < :toDate) " +
                        "ORDER BY a.createdAt DESC")
        Page<AccountOnlineFinal> findBySearch(
                        @Param("search") String search,
                        @Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate,
                        Pageable pageable);

        @Query(value = "SELECT TO_CHAR(a.created_at, 'YYYY-MM-DD') AS date, COUNT(*) AS count " +
                        "FROM acc_online_open_final a " +
                        "WHERE a.created_at >= :fromDate AND a.created_at < :toDate " +
                        "GROUP BY TO_CHAR(a.created_at, 'YYYY-MM-DD') " +
                        "ORDER BY TO_CHAR(a.created_at, 'YYYY-MM-DD')",
                        nativeQuery = true)
        List<Object[]> countByDateRange(
                        @Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate);

        @Query(value = "SELECT u.id, u.full_name, u.position, u.profile_url, u.branch, COUNT(a.id) AS cnt " +
                        "FROM acc_online_open_final a " +
                        "JOIN acc_online_users u ON u.id = a.submitted_by_user_id " +
                        "GROUP BY u.id, u.full_name, u.position, u.profile_url, u.branch " +
                        "ORDER BY cnt DESC " +
                        "LIMIT 10",
                        nativeQuery = true)
        List<Object[]> findTopUsersByAccountCount();

        // Excel
        @Query("SELECT a FROM AccountOnlineFinal a WHERE " +
                "(:search IS NULL OR :search = '' OR " +
                "LOWER(a.cif) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                "LOWER(a.legalId) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                "AND (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR a.createdAt >= :fromDate) " +
                "AND (CAST(:toDate AS java.time.LocalDateTime) IS NULL OR a.createdAt < :toDate) " +
                "ORDER BY a.createdAt DESC")
        List<AccountOnlineFinal> findBySearchExcel(
                @Param("search") String search,
                @Param("fromDate") LocalDateTime fromDate,
                @Param("toDate") LocalDateTime toDate
        );
}




