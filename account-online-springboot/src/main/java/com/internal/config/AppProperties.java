package com.internal.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private DefaultUsers defaultUsers = new DefaultUsers();
    private SuperUser superUser = new SuperUser();
    private DataLoad dataLoad = new DataLoad();

    @Data
    public static class DefaultUsers {
        private boolean create = true;
    }

    @Data
    public static class SuperUser {
        private String idCard = "phatmenghor19@gmail.com";
        private String password = "88889999";
        private String email = "phatmenghor19@gmail.com";
    }

    @Data
    public static class DataLoad {
        private int batchSize = 1000;
        private int maxRetries = 1;
        private int timeoutHours = 5;
        private int connectionTimeoutMinutes = 5;
        private int queryTimeoutHours = 4;
        private int networkTimeoutHours = 5;
        private int progressLogIntervalMinutes = 10;
        private int heartbeatIntervalMinutes = 5;
    }
}
