package com.internal.feature.open_account.repository;

import com.internal.feature.open_account.models.CifActivationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CifActivationLogRepository extends JpaRepository<CifActivationLog, UUID> {
}
