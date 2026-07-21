package com.internal.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private Secret secret = new Secret();
    private long expirationMin;
    private long refreshTokenExpirationMin = 43200; // default 30 days
    private String issuer = "cbc-sender-api";

    @Data
    public static class Secret {
        private String key;
    }
}
