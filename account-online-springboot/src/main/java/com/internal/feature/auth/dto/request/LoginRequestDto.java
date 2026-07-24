package com.internal.feature.auth.dto.request;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class LoginRequestDto {
    @NotBlank(message = "Id card  is required")
    @Size(min = 4, message = "Id card must have at least 4 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must have at least 6 characters")
    private String password;
}

