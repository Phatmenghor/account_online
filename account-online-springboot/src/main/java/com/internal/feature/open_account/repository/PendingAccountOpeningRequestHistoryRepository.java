package com.internal.feature.open_account.repository;

import com.internal.feature.open_account.models.PendingAccountOpeningRequestHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PendingAccountOpeningRequestHistoryRepository extends JpaRepository<PendingAccountOpeningRequestHistory, Long> {

    List<PendingAccountOpeningRequestHistory> findByRequestIdOrderByCreatedAtDesc(Long requestId);

    Page<PendingAccountOpeningRequestHistory> findByRequestIdOrderByCreatedAtDesc(Long requestId, Pageable pageable);

    List<PendingAccountOpeningRequestHistory> findByLegalIdOrderByCreatedAtDesc(String legalId);
}
