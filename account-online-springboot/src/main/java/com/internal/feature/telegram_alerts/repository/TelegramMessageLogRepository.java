package com.internal.feature.telegram_alerts.repository;

import com.internal.feature.telegram_alerts.models.TelegramMessageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TelegramMessageLogRepository extends JpaRepository<TelegramMessageLog, Long> {
    List<TelegramMessageLog> findByCreatedAtBefore(LocalDateTime dateTime);
}




