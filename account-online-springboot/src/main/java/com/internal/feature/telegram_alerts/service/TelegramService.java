package com.internal.feature.telegram_alerts.service;

import com.internal.feature.telegram_alerts.models.TelegramMessageLog;
import com.internal.feature.telegram_alerts.repository.TelegramMessageLogRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    @Value("${telegram.bot.junior-chat-id:-1002740302492}")
    private String juniorChatId;

    @Value("${telegram.bot.dev-chat-id:}")
    private String devChatId;

    private final RestTemplate restTemplate = new RestTemplate();
    private final TaskExecutor taskExecutor;
    private final TelegramMessageLogRepository telegramMessageLogRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TelegramService(TaskExecutor taskExecutor, TelegramMessageLogRepository telegramMessageLogRepository) {
        this.taskExecutor = taskExecutor;
        this.telegramMessageLogRepository = telegramMessageLogRepository;
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

    public void sendToJunior(String message) {
        taskExecutor.execute(() -> {
            String targetId = (juniorChatId != null && !juniorChatId.trim().isEmpty()) ? juniorChatId : monitorChatId;
            if (targetId == null || targetId.trim().isEmpty()) {
                return;
            }
            sendMarkdownToChat(targetId, message);
        });
    }

    public void sendPhotoToJunior(String caption, Resource imageResource) {
        String targetId = (juniorChatId != null && !juniorChatId.trim().isEmpty()) ? juniorChatId : monitorChatId;
        if (targetId == null || targetId.trim().isEmpty()) {
            return;
        }
        sendPhoto(targetId, caption, imageResource);
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

            String response = restTemplate.postForObject(url, requestEntity, String.class);
            saveLog(response, chatId);
            log.info("Telegram alert sent successfully to chat_id: {}", chatId);
        } catch (Exception e) {
            log.warn("Telegram markdown send failed - chat_id: {}, error: {}. Retrying as plain text...", chatId, e.getMessage());
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

                MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
                body.add("chat_id", chatId);
                body.add("text", message);

                HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);
                String url = String.format("https://api.telegram.org/bot%s/sendMessage", botToken);
                String response = restTemplate.postForObject(url, requestEntity, String.class);
                saveLog(response, chatId);
                log.info("Telegram alert sent as plain text to chat_id: {}", chatId);
            } catch (Exception retryEx) {
                log.error("Telegram send failed completely - chat_id: {}, error: {}", chatId, retryEx.getMessage());
            }
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

                String response = restTemplate.postForObject(url, requestEntity, String.class);
                saveLog(response, chatId);
            } catch (Exception e) {
                log.warn("Failed to send Telegram photo: {}", e.getMessage());
            }
        });
    }

    private void saveLog(String responseStr, String defaultChatId) {
        if (responseStr == null || responseStr.trim().isEmpty()) {
            return;
        }
        try {
            JsonNode node = objectMapper.readTree(responseStr);
            if (node.has("ok") && node.get("ok").asBoolean() && node.has("result")) {
                JsonNode result = node.get("result");
                if (result.has("message_id")) {
                    long messageId = result.get("message_id").asLong();
                    String chatId = defaultChatId;
                    if (result.has("chat") && result.get("chat").has("id")) {
                        chatId = String.valueOf(result.get("chat").get("id").asLong());
                    }
                    // Save message log for all sent messages (Monitor, Junior, Dev) for 30-day retention cleanup
                    if (chatId != null && !chatId.trim().isEmpty()) {
                        TelegramMessageLog logEntity = TelegramMessageLog.builder()
                                .chatId(chatId)
                                .messageId(messageId)
                                .build();
                        telegramMessageLogRepository.save(logEntity);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Telegram send response or save log: {}", e.getMessage(), e);
        }
    }

    public void deleteMessage(String chatId, long messageId) {
        try {
            String url = String.format("https://api.telegram.org/bot%s/deleteMessage", botToken);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("chat_id", chatId);
            body.add("message_id", String.valueOf(messageId));

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

            restTemplate.postForObject(url, requestEntity, String.class);
            log.info("Successfully requested deletion of Telegram message_id: {} in chat_id: {}", messageId, chatId);
        } catch (Exception e) {
            log.warn("Failed to delete Telegram message_id: {} in chat_id: {}. Error: {}", messageId, chatId, e.getMessage());
        }
    }
}






