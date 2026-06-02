package com.internal.feature.auth.dto.request;

import lombok.Data;

import javax.validation.constraints.*;

@Data
public class RegisterInitiateDto {

    @NotBlank(message = "Username is required.")
    @Size(min = 3, max = 255, message = "Username must be between 3 and 255 characters.")
    private String username;

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

    @NotBlank(message = "Position is required.")
    private String position;

    @NotBlank(message = "Staff ID is required.")
    private String staffId;

    @NotBlank(message = "Phone number is required.")
    private String phoneNumber;

    @NotBlank(message = "Branch is required.")
    private String branch;
}
