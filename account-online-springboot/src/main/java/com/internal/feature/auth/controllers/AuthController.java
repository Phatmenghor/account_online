package com.internal.feature.auth.controllers;

import com.internal.exceptions.response.ApiResponse;
import com.internal.feature.auth.dto.request.*;
import com.internal.feature.auth.dto.response.AuthResponseDTO;
import com.internal.feature.auth.dto.response.RegisterInitiateResponse;
import com.internal.feature.auth.dto.response.UserResponseDto;
import com.internal.feature.auth.service.AuthService;
import com.internal.utils.constants.ResponseMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
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

    @PostMapping("/register/initiate")
    public ResponseEntity<ApiResponse<RegisterInitiateResponse>> registerInitiate(
            @Valid @RequestBody RegisterInitiateDto dto) {
        log.info("Registration initiation for email: {}", dto.getEmail());
        RegisterInitiateResponse response = authService.registerInitiate(dto);
        return ResponseEntity.ok(ApiResponse.success("Verification code sent to your email.", response));
    }

    @PostMapping("/register/verify")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> registerVerify(
            @Valid @RequestBody RegisterVerifyDto dto) {
        log.info("Registration verification for email: {}", dto.getEmail());
        AuthResponseDTO authResponse = authService.registerVerify(dto);
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
}
