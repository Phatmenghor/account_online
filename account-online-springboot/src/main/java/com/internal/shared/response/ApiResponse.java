package com.internal.shared.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private String status;
    private Boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private String path;
    private Integer code;
    private Object details;

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .status("success")
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .code(200)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .status("error")
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .code(500)
                .build();
    }

    public static <T> ApiResponse<T> error(String message, T errorData) {
        return ApiResponse.<T>builder()
                .status("error")
                .success(false)
                .message(message)
                .data(errorData)
                .timestamp(LocalDateTime.now())
                .code(500)
                .build();
    }
}
