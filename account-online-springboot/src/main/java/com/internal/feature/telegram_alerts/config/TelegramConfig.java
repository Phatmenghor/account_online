package com.internal.feature.telegram_alerts.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "telegram.bot")
@Data
public class TelegramConfig {
    private String token;
    private String chatId;
    private String juniorChatId = "-1002740302492";
    private boolean enabled = true;
}

