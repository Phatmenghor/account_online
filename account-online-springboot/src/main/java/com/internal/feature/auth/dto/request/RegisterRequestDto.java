package com.internal.feature.auth.dto.request;

import com.internal.enumation.RoleEnum;
import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
public class RegisterRequestDto {

    @NotBlank(message = "Username is required")
    private String username;

    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must have at least 6 characters")
    private String password;

    private String fullName;

    private String staffId;

    private String phoneNumber;

    private String branch;

    private String department;

    private String position;

    private RoleEnum role;
}
