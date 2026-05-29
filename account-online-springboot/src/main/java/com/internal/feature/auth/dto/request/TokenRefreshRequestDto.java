package com.internal.feature.auth.dto.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class TokenRefreshRequestDto {

    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
