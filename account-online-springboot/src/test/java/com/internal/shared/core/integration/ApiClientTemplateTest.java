package com.internal.shared.core.integration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import static org.junit.jupiter.api.Assertions.*;

class ApiClientTemplateTest {

    private ApiClientTemplate apiClientTemplate;

    @BeforeEach
    void setUp() {
        WebClient.Builder webClientBuilder = WebClient.builder();
        apiClientTemplate = new ApiClientTemplate(webClientBuilder);
    }

    @Test
    @DisplayName("Should mask password and token in secret payload masking")
    void testMaskSensitivePayload() {
        String payload = "{\"username\":\"admin\",\"password\":\"super_secret_pass123\",\"token\":\"jwt_secret_token\"}";
        String masked = apiClientTemplate.maskSensitivePayload(payload);

        assertNotNull(masked);
        assertFalse(masked.contains("super_secret_pass123"));
        assertFalse(masked.contains("jwt_secret_token"));
        assertTrue(masked.contains("***MASKED***"));
    }

    @Test
    @DisplayName("Should mask password query parameters in URLs")
    void testMaskSensitiveUrl() {
        String url = "http://api.internal/v1/auth?user=admin&password=secret_password_123";
        String masked = apiClientTemplate.maskSensitiveUrl(url);

        assertNotNull(masked);
        assertFalse(masked.contains("secret_password_123"));
        assertTrue(masked.contains("***MASKED***"));
    }
}
