package com.internal.feature.auth.controller;

import com.internal.shared.response.ApiResponse;
import com.internal.feature.auth.dto.request.LoginRequestDto;
import com.internal.feature.auth.dto.request.RegisterInitiateDto;
import com.internal.feature.auth.dto.request.RegisterRequestDto;
import com.internal.feature.auth.dto.request.UpdateUserRequestDto;
import com.internal.feature.auth.dto.response.AuthResponseDTO;
import com.internal.feature.auth.dto.response.UserResponseDto;
import com.internal.feature.auth.service.AuthService;
import com.internal.shared.constant.ResponseMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@Valid @RequestBody LoginRequestDto loginDto) {
        log.info("Authentication attempt for user: {}", loginDto.getUsername());
        AuthResponseDTO authResponse = authService.login(loginDto);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.LOGIN_SUCCESS, authResponse));
    }

    @PostMapping("/register/public")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(
            @Valid @RequestBody RegisterInitiateDto dto) {
        log.info("Registration request for ID Card: {}", dto.getIdCard());
        AuthResponseDTO authResponse = authService.register(dto);
        return ResponseEntity.ok(ApiResponse.success("Registration completed successfully.", authResponse));
    }

    /** Admin-only: create user with any role */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponseDto>> createUserByAdmin(
            @Valid @RequestBody RegisterRequestDto registerDto) {
        log.info("Admin user creation for: {}", registerDto.getUsername());
        UserResponseDto userResponse = authService.createUserByAdmin(registerDto);
        return ResponseEntity.ok(ApiResponse.success("User created successfully.", userResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        authService.logout(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.LOGOUT_SUCCESS, null));
    }

    @PostMapping("/roles")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableRoles() {
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.ROLES_RETRIEVED, authService.getAvailableRoles()));
    }

    @PostMapping("/validate-token")
    public ResponseEntity<ApiResponse<Boolean>> validateToken() {
        boolean isValid = authService.validateToken();
        return ResponseEntity.ok(isValid
                ? ApiResponse.success(ResponseMessage.TOKEN_VALID, true)
                : ApiResponse.error(ResponseMessage.TOKEN_INVALID, false));
    }

    @PostMapping("/token/update-profile")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateUserProfile(
            @Valid @RequestBody UpdateUserRequestDto requestDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserResponseDto userResponse = authService.updateUserProfile(requestDto, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.PROFILE_UPDATED, userResponse));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<com.internal.feature.auth.dto.response.RefreshTokenResponseDto>> refresh(
            @Valid @RequestBody com.internal.feature.auth.dto.request.RefreshTokenRequestDto requestDto) {
        log.info("Token refresh request received");
        com.internal.feature.auth.dto.response.RefreshTokenResponseDto response = authService.refreshToken(requestDto);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully.", response));
    }
}





