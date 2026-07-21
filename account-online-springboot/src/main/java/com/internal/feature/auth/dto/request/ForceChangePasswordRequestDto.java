package com.internal.feature.auth.dto.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
public class ForceChangePasswordRequestDto {

    @NotBlank(message = "New password is required.")
    @Size(min = 6, message = "Password must be at least 6 characters long.")
    private String newPassword;

    @NotBlank(message = "Please confirm your new password.")
    @Size(min = 6, message = "Password must be at least 6 characters long.")
    private String confirmNewPassword;
}

