package com.internal.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private Secret secret = new Secret();
    private long expirationMin = 525600L; // default 1 year (365 days)
    private String issuer = "account-online-api";

    @Data
    public static class Secret {
        private String key;
    }
}
