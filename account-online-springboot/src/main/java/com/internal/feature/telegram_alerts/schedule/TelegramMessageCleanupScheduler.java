package com.internal.feature.telegram_alerts.schedule;

import com.internal.feature.telegram_alerts.config.TelegramService;
import com.internal.feature.telegram_alerts.model.TelegramMessageLog;
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
        log.info("Starting Telegram bot message cleanup task. Retention: {} days", retentionDays);
        try {
            LocalDateTime threshold = LocalDateTime.now().minusDays(retentionDays);
            List<TelegramMessageLog> messagesToDelete = telegramMessageLogRepository.findByCreatedAtBefore(threshold);

            if (messagesToDelete.isEmpty()) {
                log.info("No Telegram messages found for deletion (older than {} days).", retentionDays);
                return;
            }

            log.info("Found {} Telegram messages to delete.", messagesToDelete.size());
            for (TelegramMessageLog msg : messagesToDelete) {
                // Call deleteMessage API
                telegramService.deleteMessage(msg.getChatId(), msg.getMessageId());
                // Delete log from database whether API succeeded or failed (e.g. 48h limit reached)
                telegramMessageLogRepository.delete(msg);
            }
            log.info("Telegram message cleanup task finished.");
        } catch (Exception e) {
            log.error("Error during Telegram message cleanup: {}", e.getMessage(), e);
        }
    }
}
