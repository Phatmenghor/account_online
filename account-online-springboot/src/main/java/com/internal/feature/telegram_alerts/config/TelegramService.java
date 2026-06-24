package com.internal.feature.telegram_alerts.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.task.TaskExecutor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.io.Resource;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class TelegramService {

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.monitor-chat-id:}")
    private String monitorChatId;

    @Value("${telegram.bot.dev-chat-id:}")
    private String devChatId;

    private final RestTemplate restTemplate = new RestTemplate();
    private final TaskExecutor taskExecutor;

    public TelegramService(TaskExecutor taskExecutor) {
        this.taskExecutor = taskExecutor;
    }

    public void sendToDev(String message) {
        taskExecutor.execute(() -> {
            if (devChatId == null || devChatId.trim().isEmpty()) {
                return;
            }
            sendMarkdownToChat(devChatId, message);
        });
    }

    public void sendToMonitor(String message) {
        taskExecutor.execute(() -> {
            if (monitorChatId == null || monitorChatId.trim().isEmpty()) {
                return;
            }
            sendMarkdownToChat(monitorChatId, message);
        });
    }

    public void sendCriticalAlert(String title, String details) {
        taskExecutor.execute(() -> {
            String message = String.format("*🚨 %s*\n%s", title, details);
            sendMarkdownToChat(monitorChatId, message);
        });
    }

    public void sendMarkdownToChat(String chatId, String message) {
        if (chatId == null || chatId.trim().isEmpty()) {
            return;
        }
        try {
            String url = String.format("https://api.telegram.org/bot%s/sendMessage", botToken);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("chat_id", chatId);
            body.add("text", message);
            body.add("parse_mode", "Markdown");

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

            restTemplate.postForObject(url, requestEntity, String.class);
        } catch (Exception e) {
            log.warn("Telegram send failed - chat_id: {}, error: {}", chatId, e.getMessage());
        }
    }

    public void sendPhotoToMonitor(String caption, Resource imageResource) {
        if (monitorChatId == null || monitorChatId.trim().isEmpty()) {
            return;
        }
        sendPhoto(monitorChatId, caption, imageResource);
    }

    public void sendPhoto(String chatId, String caption, Resource imageResource) {
        if (chatId == null || chatId.trim().isEmpty()) {
            return;
        }
        taskExecutor.execute(() -> {
            try {
                String url = String.format("https://api.telegram.org/bot%s/sendPhoto", botToken);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);

                MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
                body.add("chat_id", chatId);
                body.add("caption", caption);
                body.add("photo", imageResource);
                body.add("parse_mode", "Markdown");

                HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

                restTemplate.postForObject(url, requestEntity, String.class);
            } catch (Exception e) {
                log.warn("Failed to send Telegram photo: {}", e.getMessage());
            }
        });
    }
}
