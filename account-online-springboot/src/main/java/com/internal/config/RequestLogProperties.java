package com.internal.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.util.ArrayList;
import java.util.List;

@Data
@Configuration
@ConfigurationProperties(prefix = "request.log")
public class RequestLogProperties {
    private Retention retention = new Retention();
    private boolean enabled = true;
    private List<String> excludePaths = new ArrayList<>();

    @Data
    public static class Retention {
        private int days = 30;
    }
}
