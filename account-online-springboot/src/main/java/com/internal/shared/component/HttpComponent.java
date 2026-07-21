package com.internal.shared.component;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class HttpComponent {

    private final RestTemplate restTemplate;

    /**
     * Executes an HTTP POST request.
     */
    public <T, R> ResponseEntity<R> post(String url, T requestBody, HttpHeaders headers, Class<R> responseType) {
        HttpEntity<T> entity = new HttpEntity<>(requestBody, headers);
        return restTemplate.exchange(url, HttpMethod.POST, entity, responseType);
    }

    /**
     * Executes an HTTP GET request.
     */
    public <R> ResponseEntity<R> get(String url, HttpHeaders headers, Class<R> responseType) {
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        return restTemplate.exchange(url, HttpMethod.GET, entity, responseType);
    }
}
