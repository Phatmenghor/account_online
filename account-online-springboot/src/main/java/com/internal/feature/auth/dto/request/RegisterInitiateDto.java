package com.internal.feature.auth.dto.request;

import lombok.Data;

import javax.validation.constraints.*;

@Data
public class RegisterInitiateDto {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    private String fullName;
    private String position;
    private String staffId;
    private String phoneNumber;
    private String branch;
}
