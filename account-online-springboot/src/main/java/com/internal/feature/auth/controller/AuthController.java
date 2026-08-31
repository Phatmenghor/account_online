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
        log.info("[AuthController] Authentication attempt for username={}", loginDto.getUsername());
        AuthResponseDTO authResponse = authService.login(loginDto);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.LOGIN_SUCCESS, authResponse));
    }

    @PostMapping("/register/public")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(
            @Valid @RequestBody RegisterInitiateDto dto) {
        log.info("[AuthController] Registration request for idCard={}", dto.getIdCard());
        AuthResponseDTO authResponse = authService.register(dto);
        return ResponseEntity.ok(ApiResponse.success("Registration completed successfully.", authResponse));
    }

    /** Admin-only: create user with any role */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponseDto>> createUserByAdmin(
            @Valid @RequestBody RegisterRequestDto registerDto) {
        log.info("[AuthController] Admin user creation request for username={}", registerDto.getUsername());
        UserResponseDto userResponse = authService.createUserByAdmin(registerDto);
        return ResponseEntity.ok(ApiResponse.success("User created successfully.", userResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("[AuthController] User logout request. username={}", auth != null ? auth.getName() : "anonymous");
        authService.logout(auth != null ? auth.getName() : "");
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.LOGOUT_SUCCESS, null));
    }

    @PostMapping("/roles")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableRoles() {
        log.info("[AuthController] Fetching available user roles");
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.ROLES_RETRIEVED, authService.getAvailableRoles()));
    }

    @PostMapping("/validate-token")
    public ResponseEntity<ApiResponse<Boolean>> validateToken() {
        log.info("[AuthController] Validating authentication token");
        boolean isValid = authService.validateToken();
        return ResponseEntity.ok(isValid
                ? ApiResponse.success(ResponseMessage.TOKEN_VALID, true)
                : ApiResponse.error(ResponseMessage.TOKEN_INVALID, false));
    }

    @PostMapping("/token/update-profile")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateUserProfile(
            @Valid @RequestBody UpdateUserRequestDto requestDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("[AuthController] Profile update request for username={}", authentication != null ? authentication.getName() : "anonymous");
        UserResponseDto userResponse = authService.updateUserProfile(requestDto, authentication != null ? authentication.getName() : "");
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.PROFILE_UPDATED, userResponse));
    }
}





