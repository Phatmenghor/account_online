package com.internal.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "aml")
public class AmlProperties {
    private Api api = new Api();
    private Dashboard dashboard = new Dashboard();

    @Data
    public static class Api {
        private String key;
        private String secretKey;
    }

    @Data
    public static class Dashboard {
        private String url;
    }
}
