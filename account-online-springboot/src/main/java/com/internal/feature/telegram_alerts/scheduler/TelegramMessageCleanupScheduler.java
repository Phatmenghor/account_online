package com.internal.feature.telegram_alerts.scheduler;

import com.internal.feature.telegram_alerts.service.TelegramService;
import com.internal.feature.telegram_alerts.models.TelegramMessageLog;
import com.internal.feature.telegram_alerts.repository.TelegramMessageLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class TelegramMessageCleanupScheduler {

    private final TelegramService telegramService;
    private final TelegramMessageLogRepository telegramMessageLogRepository;

    @Value("${telegram.bot.message-retention-days:30}")
    private int retentionDays;

    // Run daily at 3:00 AM to check for messages that need to be deleted
    @Scheduled(cron = "0 0 3 * * ?", zone = "Asia/Phnom_Penh")
    public void cleanupOldMessages() {
        long start = System.currentTimeMillis();
        log.info("[TelegramMessageCleanupScheduler] Scheduled message cleanup job started. retentionDays={}", retentionDays);
        int deletedCount = 0;
        try {
            LocalDateTime threshold = LocalDateTime.now().minusDays(retentionDays);
            List<TelegramMessageLog> messagesToDelete = telegramMessageLogRepository.findByCreatedAtBefore(threshold);

            if (messagesToDelete.isEmpty()) {
                long duration = System.currentTimeMillis() - start;
                log.info("[TelegramMessageCleanupScheduler] Scheduled message cleanup job completed. No messages older than {} days found. durationMs={}", retentionDays, duration);
                return;
            }

            log.info("[TelegramMessageCleanupScheduler] Processing deletion of {} Telegram messages.", messagesToDelete.size());
            for (TelegramMessageLog msg : messagesToDelete) {
                telegramService.deleteMessage(msg.getChatId(), msg.getMessageId());
                telegramMessageLogRepository.delete(msg);
                deletedCount++;
            }
            long duration = System.currentTimeMillis() - start;
            log.info("[TelegramMessageCleanupScheduler] Scheduled message cleanup job completed. deletedCount={}, durationMs={}", deletedCount, duration);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            log.error("[TelegramMessageCleanupScheduler] Scheduled message cleanup job failed. deletedCount={}, durationMs={}, error={}", deletedCount, duration, e.getMessage(), e);
        }
    }
}






