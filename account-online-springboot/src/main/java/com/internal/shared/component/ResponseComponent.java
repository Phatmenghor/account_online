package com.internal.shared.component;

import com.internal.shared.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ResponseComponent {

    /**
     * Build a success ResponseEntity.
     */
    public <T> ResponseEntity<ApiResponse<T>> success(String message, T data) {
        ApiResponse<T> body = ApiResponse.<T>builder()
                .status("success")
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .code(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(body);
    }

    /**
     * Build a success ResponseEntity without data body.
     */
    public <T> ResponseEntity<ApiResponse<T>> success(String message) {
        return success(message, null);
    }

    /**
     * Build an error ResponseEntity.
     */
    public <T> ResponseEntity<ApiResponse<T>> error(HttpStatus status, String message) {
        ApiResponse<T> body = ApiResponse.<T>builder()
                .status("error")
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .code(status.value())
                .build();
        return new ResponseEntity<>(body, status);
    }

    /**
     * Build an error ResponseEntity with details.
     */
    public <T> ResponseEntity<ApiResponse<T>> error(HttpStatus status, String message, Object details) {
        ApiResponse<T> body = ApiResponse.<T>builder()
                .status("error")
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .code(status.value())
                .details(details)
                .build();
        return new ResponseEntity<>(body, status);
    }
}

