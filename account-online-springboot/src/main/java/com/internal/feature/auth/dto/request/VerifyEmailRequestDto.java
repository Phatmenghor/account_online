package com.internal.feature.auth.dto.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class VerifyEmailRequestDto {
    @NotBlank(message = "Email is required")
    private String username;

    @NotBlank(message = "Verification code is required")
    private String code;
}
