package com.internal.feature.auth.dto.request;

import lombok.Data;

import jakarta.validation.constraints.*;

@Data
public class RegisterInitiateDto {

    @NotBlank(message = "ID Card is required.")
    @Size(min = 3, max = 255, message = "ID Card must be between 3 and 255 characters.")
    private String idCard;

    @NotBlank(message = "Email address is required.")
    @Email(message = "Please enter a valid email address (e.g. name@example.com).")
    private String email;

    @NotBlank(message = "Password is required.")
    @Size(min = 6, message = "Password must be at least 6 characters long.")
    private String password;

    @NotBlank(message = "Please confirm your password.")
    private String confirmPassword;

    @NotBlank(message = "Full name is required.")
    private String fullName;

    private String position;

    private String department;

    private String phoneNumber;

    private String branch;
}

