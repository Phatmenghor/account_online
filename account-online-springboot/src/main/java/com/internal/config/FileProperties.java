package com.internal.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "file")
public class FileProperties {
    private Upload upload = new Upload();

    @Data
    public static class Upload {
        private String directory = "/app/customer-image";
        private String nid = "/nid";
        private String selfie = "/selfie";
        private String junior = "/junior";
        private String referenceDoc = "/reference-doc";
    }
}
