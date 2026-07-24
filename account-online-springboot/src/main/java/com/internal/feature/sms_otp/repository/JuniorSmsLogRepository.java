package com.internal.feature.sms_otp.repository;

import com.internal.feature.sms_otp.models.JuniorSmsLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JuniorSmsLogRepository extends JpaRepository<JuniorSmsLog, Long> {
}
