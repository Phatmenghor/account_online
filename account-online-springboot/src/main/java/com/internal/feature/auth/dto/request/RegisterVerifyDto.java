package com.internal.feature.auth.dto.request;

import lombok.Data;

import javax.validation.constraints.*;

@Data
public class RegisterVerifyDto {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "OTP code is required")
    @Size(min = 6, max = 6, message = "OTP must be 6 digits")
    private String otpCode;
}
