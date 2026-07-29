package com.internal.shared.core.integration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Enterprise API Client Template providing secure WebClient execution with secret-masked logging,
 * automatic timeout handling, and resilience.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ApiClientTemplate {

    private final WebClient.Builder webClientBuilder;

    /**
     * Executes an HTTP POST request reactively with strict timeouts and payload masking.
     */
    public <R, T> Mono<T> postJson(String url, R requestBody, Class<T> responseType, Duration timeout, HttpHeaders customHeaders) {
        log.info("Executing REST POST request to URL: {}", maskSensitiveUrl(url));

        WebClient webClient = webClientBuilder.build();

        return webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> {
                    if (customHeaders != null) {
                        headers.addAll(customHeaders);
                    }
                })
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(responseType)
                .timeout(timeout != null ? timeout : Duration.ofSeconds(30))
                .doOnSuccess(res -> log.debug("REST POST completed successfully for URL: {}", maskSensitiveUrl(url)))
                .doOnError(err -> log.error("REST POST failed for URL: {} | Error: {}", maskSensitiveUrl(url), err.getMessage()));
    }

    /**
     * Mask sensitive query parameters or authorization strings in URLs.
     */
    public String maskSensitiveUrl(String url) {
        if (url == null) return "";
        return url.replaceAll("(?i)(password|secret|token|key|api_key)=([^&]+)", "$1=***MASKED***");
    }

    /**
     * Mask sensitive fields in JSON strings or raw XML payloads.
     */
    public String maskSensitivePayload(String payload) {
        if (payload == null) return "";
        return payload.replaceAll("(?i)(\"(password|secret|token|apiKey|key)\"\\s*:\\s*\")[^\"]+(\")", "$1***MASKED***$3")
                .replaceAll("(?i)(<(password|secret|token|apiKey)>)[^<]+(</\\2>)", "$1***MASKED***$3");
    }
}
