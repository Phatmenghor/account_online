package com.internal.feature.auth.service;

import com.internal.feature.auth.dto.request.LoginRequestDto;
import com.internal.feature.auth.dto.request.RegisterRequestDto;
import com.internal.feature.auth.dto.request.UpdateUserRequestDto;
import com.internal.feature.auth.dto.request.VerifyEmailRequestDto;
import com.internal.feature.auth.dto.response.AuthResponseDTO;
import com.internal.feature.auth.dto.response.UserResponseDto;

import java.util.List;
import java.util.Map;

public interface AuthService {
    AuthResponseDTO login(LoginRequestDto loginDto);

    void logout(String username);

    UserResponseDto register(RegisterRequestDto registerDto);

    void verifyEmail(VerifyEmailRequestDto requestDto);

    void resendVerificationCode(String email);

    UserResponseDto createUserByAdmin(RegisterRequestDto registerDto);

    UserResponseDto updateUserProfile(UpdateUserRequestDto registerDto, String name);

    List<Map<String, Object>> getAvailableRoles();

    boolean validateToken();
}
