package com.internal.feature.aml.repository;

import com.internal.feature.aml.models.AmlHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AmlHistoryRepository extends JpaRepository<AmlHistory, Long>, JpaSpecificationExecutor<AmlHistory> {

    @Query(value =
            "SELECT u.id, u.full_name, u.position, u.profile_url, u.branch, " +
            "       COALESCE(ap.approve_count, 0) AS approve_count, " +
            "       COALESCE(rj.reject_count, 0)  AS reject_count, " +
            "       COALESCE(ap.approve_count, 0) + COALESCE(rj.reject_count, 0) AS total_count " +
            "FROM acc_online_users u " +
            "LEFT JOIN (SELECT approved_by AS uid, COUNT(*) AS approve_count " +
            "           FROM acc_online_aml_history WHERE approved_by IS NOT NULL GROUP BY approved_by) ap ON ap.uid = u.id " +
            "LEFT JOIN (SELECT rejected_by AS uid, COUNT(*) AS reject_count " +
            "           FROM acc_online_aml_history WHERE rejected_by IS NOT NULL GROUP BY rejected_by) rj ON rj.uid = u.id " +
            "WHERE ap.uid IS NOT NULL OR rj.uid IS NOT NULL " +
            "ORDER BY total_count DESC " +
            "LIMIT 10",
            nativeQuery = true)
    List<Object[]> findTopAmlActionUsers();
}




