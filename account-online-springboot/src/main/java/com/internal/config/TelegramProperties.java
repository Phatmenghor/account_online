package com.internal.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "telegram.bot")
public class TelegramProperties {
    private String token;
    private String devChatId;
    private String monitorChatId;
    private String juniorChatId = "-1002740302492";
    private String complianceMention;
    private boolean enabled;
    private int messageRetentionDays = 30;
}
