package com.internal.feature.auth.dto.request;

import com.internal.enumation.RoleEnum;
import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
public class RegisterRequestDto {

    /** username is the email address used as login identifier */
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must have at least 6 characters")
    private String password;

    private String fullName;

    @NotBlank(message = "Staff ID is required")
    private String staffId;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    private RoleEnum role;

    private String position;
}
