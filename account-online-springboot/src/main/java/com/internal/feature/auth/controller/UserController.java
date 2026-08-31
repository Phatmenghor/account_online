package com.internal.feature.auth.controller;

import com.internal.shared.response.ApiResponse;
import com.internal.feature.auth.dto.request.ChangePasswordByAdminRequestDto;
import com.internal.feature.auth.dto.request.ChangePasswordRequestDto;
import com.internal.feature.auth.dto.request.ForceChangePasswordRequestDto;
import com.internal.feature.auth.dto.request.GetAllUserRequestDto;
import com.internal.feature.auth.dto.request.RegisterRequestDto;
import com.internal.feature.auth.dto.request.UpdateUserRequestDto;
import com.internal.feature.auth.dto.response.AllUserResponseDto;
import com.internal.feature.auth.dto.response.AuthResponseDTO;
import com.internal.feature.auth.dto.response.UserResponseDto;
import com.internal.feature.auth.service.AuthService;
import com.internal.feature.auth.service.UserService;
import com.internal.shared.constant.ResponseMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<ApiResponse<AllUserResponseDto>> getAllUsers(@Valid @RequestBody GetAllUserRequestDto request) {
        log.info("[UserController] Fetching users. page={}, size={}, search={}, status={}",
                request.getPageNo(), request.getPageSize(), request.getSearch(), request.getStatus());
        AllUserResponseDto result = userService.getAllUser(request);
        log.info("[UserController] Successfully retrieved {} users (page {}/{})", result.getContent() != null ? result.getContent().size() : 0, result.getPageNo(), result.getTotalPages());
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.USERS_RETRIEVED, result));
    }

    @PostMapping("/getById/{id}")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserDetail(@PathVariable Long id) {
        log.info("[UserController] Fetching user details for id={}", id);
        UserResponseDto user = userService.getUserById(id);
        log.info("[UserController] Successfully retrieved user details for id={}", id);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.USER_DETAIL_RETRIEVED, user));
    }

    @PostMapping("/token")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserByToken() {
        log.info("[UserController] Fetching current authenticated user profile by token");
        UserResponseDto user = userService.getUserByToken();
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.CURRENT_USER_RETRIEVED, user));
    }

    @PostMapping("/create-user")
    public ResponseEntity<ApiResponse<UserResponseDto>> createUser(@Valid @RequestBody RegisterRequestDto registerDto) {
        log.info("[UserController] Admin user creation request for username={}", registerDto.getUsername());
        UserResponseDto userResponse = authService.createUserByAdmin(registerDto);
        log.info("[UserController] Admin user creation successful for username={}", registerDto.getUsername());
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.USER_CREATED, userResponse));
    }

    @PostMapping("/deleteById/{id}")
    public ResponseEntity<ApiResponse<UserResponseDto>> deleteUser(@PathVariable("id") Long userId) {
        log.info("[UserController] Deleting user with id={}", userId);
        UserResponseDto deletedUser = userService.deleteUserId(userId);
        log.info("[UserController] Successfully deleted user idCard={} (id={})", deletedUser.getIdCard(), userId);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.USER_DELETED, deletedUser));
    }

    @PostMapping("/updateById/{id}")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateUser(@PathVariable("id") Long userId,
                                                                   @Valid @RequestBody UpdateUserRequestDto request) {
        log.info("[UserController] Updating user id={}", userId);
        UserResponseDto updatedUser = userService.updateUserId(userId, request);
        log.info("[UserController] Successfully updated user idCard={} (id={})", updatedUser.getIdCard(), userId);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.USER_UPDATED, updatedUser));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<UserResponseDto>> changePassword(@Valid @RequestBody ChangePasswordRequestDto changePasswordDto) {
        log.info("[UserController] Password change request for current user");
        UserResponseDto userDto = userService.changePassword(changePasswordDto);
        log.info("[UserController] Successfully changed password for user idCard={}", userDto.getIdCard());
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.PASSWORD_CHANGED, userDto));
    }

    @PostMapping("/change-password-by-admin")
    public ResponseEntity<ApiResponse<UserResponseDto>> changePasswordByAdmin(@Valid @RequestBody ChangePasswordByAdminRequestDto changePasswordDto) {
        log.info("[UserController] Admin password change request for user id={}", changePasswordDto.getId());
        UserResponseDto userDto = userService.changePasswordByAdmin(changePasswordDto);
        log.info("[UserController] Admin successfully changed password for user id={}, username={}", changePasswordDto.getId(), userDto.getIdCard());
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.PASSWORD_CHANGED_BY_ADMIN, userDto));
    }

    @PostMapping("/force-change-password")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> forceChangePassword(@Valid @RequestBody ForceChangePasswordRequestDto dto) {
        log.info("[UserController] Force password change request");
        AuthResponseDTO authResponse = userService.forceChangePassword(dto.getNewPassword(), dto.getConfirmNewPassword());
        log.info("[UserController] Force password change completed successfully");
        return ResponseEntity.ok(ApiResponse.success("Password updated successfully.", authResponse));
    }
}



