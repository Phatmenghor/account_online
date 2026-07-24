package com.internal.feature.auth.dto.request;

import com.internal.enumation.RoleEnum;
import lombok.Data;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class RegisterRequestDto {

    @NotBlank(message = "Username is required.")
    private String username;

    private String email;

    @NotBlank(message = "Password is required.")
    @Size(min = 6, message = "Password must be at least 6 characters long.")
    private String password;

    private String fullName;

    private String phoneNumber;

    private String branch;

    private String department;

    private String position;

    private RoleEnum role;
}

