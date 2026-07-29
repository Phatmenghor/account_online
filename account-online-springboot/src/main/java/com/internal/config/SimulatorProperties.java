package com.internal.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
public class SimulatorProperties {
    private boolean reportLogs = false;
    private Aml aml = new Aml();
    private boolean camdx = false;
    private Banking banking = new Banking();

    @Data
    public static class Aml {
        private boolean error = false;
        private boolean highRisk = false;
    }

    @Data
    public static class Banking {
        private boolean camdxError = false;
        private boolean internalError = false;
    }
}
