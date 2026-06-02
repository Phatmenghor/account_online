package com.internal.feature.auth.service.impl;

import com.internal.enumation.RoleEnum;
import com.internal.enumation.StatusData;
import com.internal.exceptions.error.custom.*;
import com.internal.feature.auth.dto.request.*;
import com.internal.feature.auth.dto.response.AuthResponseDTO;
import com.internal.feature.auth.dto.response.RegisterInitiateResponse;
import com.internal.feature.auth.dto.response.UserResponseDto;
import com.internal.feature.auth.mapper.AuthMapper;
import com.internal.feature.auth.mapper.UserMapper;
import com.internal.feature.auth.models.Role;
import com.internal.feature.auth.models.UserEntity;
import com.internal.feature.auth.repository.RoleRepository;
import com.internal.feature.auth.repository.UserRepository;
import com.internal.feature.auth.security.JWTGenerator;
import com.internal.feature.auth.service.AuthService;
import com.internal.feature.auth.service.EmailService;
import com.internal.feature.auth.service.PendingRegistrationStore;
import com.internal.feature.email_otp.models.EmailOtp;
import com.internal.feature.email_otp.repository.EmailOtpRepository;
import com.internal.utils.OtpGenerator;
import com.internal.utils.constants.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTGenerator jwtGenerator;
    private final AuthMapper authMapper;
    private final UserMapper userMapper;
    private final EmailOtpRepository emailOtpRepository;
    private final OtpGenerator otpGenerator;
    private final EmailService emailService;
    private final PendingRegistrationStore pendingRegistrationStore;

    @Override
    public AuthResponseDTO login(LoginRequestDto loginDto) {
        log.info("Processing login request for user: {}", loginDto.getUsername());

        UserEntity userEntity = userRepository.findByUsername(loginDto.getUsername())
                .orElseThrow(() -> new UnauthorizedException(
                        "We couldn't find an account with the username \"" + loginDto.getUsername() + "\". "
                        + "Please double-check your username and try again."));

        if (userEntity.getStatus() == StatusData.INACTIVE) {
            log.warn("Login rejected: User {} account is inactive", loginDto.getUsername());
            throw new UnauthorizedException(
                    "Your account \"" + loginDto.getUsername() + "\" is currently inactive. "
                    + "Please contact your administrator to reactivate your account.");
        }

        if (userEntity.getStatus() == StatusData.DELETE) {
            log.warn("Login rejected: User {} account has been deleted", loginDto.getUsername());
            throw new UnauthorizedException(
                    "Your account \"" + loginDto.getUsername() + "\" has been deactivated. "
                    + "Please contact your administrator for further assistance.");
        }

        if (!passwordEncoder.matches(loginDto.getPassword(), userEntity.getPassword())) {
            log.warn("Login failed: Incorrect password for user {}", loginDto.getUsername());
            throw new UnauthorizedException(
                    "The password you entered is incorrect. "
                    + "Please check your password and try again.");
        }

        userEntity.setLastLogin(LocalDateTime.now(ZoneId.of("Asia/Phnom_Penh")));
        userRepository.save(userEntity);

        List<String> roles = userEntity.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());
        String token = jwtGenerator.generateTokenForUser(userEntity.getUsername(), roles);

        UserResponseDto userDto = authMapper.userToUserResponseDto(userEntity);
        userDto.setLastLogin(userEntity.getLastLogin());
        log.info("User {} logged in successfully", loginDto.getUsername());
        return new AuthResponseDTO(token, userDto);
    }

    @Override
    public void logout(String username) {
        log.info("User logged out: {}", username);
    }

    @Override
    public RegisterInitiateResponse registerInitiate(RegisterInitiateDto dto) {
        log.info("Processing registration initiation for email: {}", dto.getEmail());

        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new BadRequestException(
                    "The passwords you entered do not match. "
                    + "Please make sure both fields contain the same password.");
        }

        if (userRepository.existsByEmail(dto.getEmail()) || userRepository.existsByUsername(dto.getUsername())) {
            throw new DuplicateNameException(
                    "An account with the email address \"" + dto.getEmail() + "\" already exists. "
                    + "Please sign in to your existing account instead.");
        }

        // Store pending registration data keyed by email (used for OTP)
        pendingRegistrationStore.put(dto.getEmail(), dto);

        // Expire existing OTPs and generate a new one
        emailOtpRepository.expireAllActiveOtpsByEmail(dto.getEmail());

        String otpCode = otpGenerator.generate();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);

        EmailOtp emailOtp = EmailOtp.builder()
                .email(dto.getEmail())
                .otpCode(otpCode)
                .attempt(0)
                .status(0)
                .expiresAt(expiresAt)
                .build();
        emailOtpRepository.save(emailOtp);

        // Skip email for default dev OTP (same pattern as SMS OTP)
        if (AppConstants.DEFAULT_DEV_OTP.equals(otpCode)) {
            log.info("Dev environment: skipping email send, OTP is default code for: {}", dto.getEmail());
        } else {
            try {
                emailService.sendOtpEmail(dto.getEmail(), otpCode);
            } catch (Exception e) {
                log.error("Failed to send OTP email to {}: {}", dto.getEmail(), e.getMessage());
            }
        }

        log.info("Registration OTP sent to email: {}", dto.getEmail());
        return RegisterInitiateResponse.builder()
                .message("A 6-digit verification code has been sent to \"" + dto.getEmail() + "\". "
                        + "Please check your inbox and enter the code within 5 minutes to complete your registration.")
                .email(dto.getEmail())
                .expiresAt(expiresAt.toString())
                .build();
    }

    @Override
    public AuthResponseDTO registerVerify(RegisterVerifyDto dto) {
        log.info("Processing registration verification for email: {}", dto.getEmail());

        // Find active OTP
        EmailOtp latestOtp = emailOtpRepository.findLatestActiveOtpByEmail(dto.getEmail())
                .orElseThrow(() -> new BadRequestException(
                        "No active verification code was found for \"" + dto.getEmail() + "\". "
                        + "Please go back and request a new code."));

        // Validate OTP
        boolean isValid = latestOtp.getOtpCode().equals(dto.getOtpCode())
                && latestOtp.getExpiresAt().isAfter(LocalDateTime.now());

        if (!isValid) {
            int attempts = latestOtp.getAttempt() + 1;
            latestOtp.setAttempt(attempts);
            latestOtp.setLastAttempt(LocalDateTime.now());
            emailOtpRepository.save(latestOtp);

            int remaining = Math.max(0, AppConstants.MAX_ATTEMPTS - attempts);
            if (remaining <= 0) {
                throw new UnauthorizedException(
                        "Too many incorrect attempts. Your verification code has been invalidated. "
                        + "Please go back and request a new code to continue.");
            }
            throw new UnauthorizedException(
                    "That verification code is incorrect. "
                    + "You have " + remaining + " attempt" + (remaining == 1 ? "" : "s") + " remaining.");
        }

        // Mark OTP verified
        latestOtp.setStatus(1);
        latestOtp.setVerifiedAt(LocalDateTime.now());
        emailOtpRepository.save(latestOtp);

        // Get pending registration data
        RegisterInitiateDto pendingData = pendingRegistrationStore.get(dto.getEmail())
                .orElseThrow(() -> new BadRequestException(
                        "Your registration session has expired. "
                        + "Please start the registration process again."));

        // Re-check in case taken while waiting for OTP
        if (userRepository.existsByUsername(pendingData.getUsername())) {
            pendingRegistrationStore.remove(dto.getEmail());
            throw new DuplicateNameException(
                    "The email address \"" + dto.getEmail() + "\" was registered by someone else while you were verifying. "
                    + "Please start the registration process again.");
        }

        // Create user with STAFF role
        Role role = roleRepository.findByName(RoleEnum.STAFF)
                .orElseThrow(() -> new BadRequestException("STAFF role not found."));

        UserEntity user = new UserEntity();
        user.setUsername(pendingData.getUsername());
        user.setEmail(pendingData.getEmail());
        user.setFullName(pendingData.getFullName());
        user.setPosition(pendingData.getPosition());
        user.setStaffId(pendingData.getStaffId());
        user.setPhoneNumber(pendingData.getPhoneNumber());
        user.setBranch(pendingData.getBranch());
        user.setPassword(passwordEncoder.encode(pendingData.getPassword()));
        user.setStatus(StatusData.ACTIVE);
        user.setRoles(Collections.singletonList(role));
        user.setLastLogin(LocalDateTime.now(ZoneId.of("Asia/Phnom_Penh")));
        userRepository.save(user);

        pendingRegistrationStore.remove(dto.getEmail());

        List<String> roles = Collections.singletonList(RoleEnum.STAFF.name());
        String token = jwtGenerator.generateTokenForUser(user.getUsername(), roles);

        UserResponseDto userDto = authMapper.userToUserResponseDto(user);
        userDto.setLastLogin(user.getLastLogin());
        log.info("Registration completed and user created: {}", dto.getEmail());
        return new AuthResponseDTO(token, userDto);
    }

    @Override
    public UserResponseDto createUserByAdmin(RegisterRequestDto registerDto) {
        log.info("Processing admin user creation for: {}", registerDto.getUsername());

        if (userRepository.existsByUsername(registerDto.getUsername())
                || (registerDto.getEmail() != null && userRepository.existsByEmail(registerDto.getEmail()))) {
            throw new DuplicateNameException(
                    "An account with this email address already exists. "
                    + "Please use a different email address.");
        }

        Role role = roleRepository.findByName(registerDto.getRole())
                .orElseThrow(() -> new BadRequestException("Invalid role provided: " + registerDto.getRole()));

        UserEntity user = new UserEntity();
        user.setUsername(registerDto.getUsername());
        user.setEmail(registerDto.getEmail());
        user.setFullName(registerDto.getFullName());
        user.setPosition(registerDto.getPosition());
        user.setStaffId(registerDto.getStaffId());
        user.setPhoneNumber(registerDto.getPhoneNumber());
        user.setBranch(registerDto.getBranch());
        user.setDepartment(registerDto.getDepartment());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        user.setStatus(StatusData.ACTIVE);
        user.getRoles().add(role);

        UserEntity savedUser = userRepository.save(user);
        log.info("Admin user creation successful for: {}", registerDto.getUsername());
        return authMapper.userToUserResponseDto(savedUser);
    }

    @Override
    public UserResponseDto updateUserProfile(UpdateUserRequestDto requestDto, String name) {
        log.info("Processing update user profile: {}", name);

        UserEntity user = userRepository.findByUsername(name)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (requestDto.getEmail() != null) user.setEmail(requestDto.getEmail());
        if (requestDto.getStatus() != null) user.setStatus(requestDto.getStatus());
        if (requestDto.getFullName() != null) user.setFullName(requestDto.getFullName());
        if (requestDto.getProfileUrl() != null) user.setProfileUrl(requestDto.getProfileUrl());
        if (requestDto.getPosition() != null) user.setPosition(requestDto.getPosition());
        if (requestDto.getStaffId() != null) user.setStaffId(requestDto.getStaffId());
        if (requestDto.getPhoneNumber() != null) user.setPhoneNumber(requestDto.getPhoneNumber());
        if (requestDto.getBranch() != null) user.setBranch(requestDto.getBranch());
        if (requestDto.getDepartment() != null) user.setDepartment(requestDto.getDepartment());

        UserEntity updatedUser = userRepository.save(user);
        return userMapper.mapToDto(updatedUser);
    }

    @Override
    public List<Map<String, Object>> getAvailableRoles() {
        return Arrays.stream(RoleEnum.values())
                .map(role -> {
                    Map<String, Object> roleMap = new HashMap<>();
                    roleMap.put("code", role.name());
                    roleMap.put("displayName", formatDisplayName(role.name()));
                    return roleMap;
                })
                .collect(Collectors.toList());
    }

    @Override
    public boolean validateToken() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Optional<UserEntity> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent() && userOpt.get().getStatus() != StatusData.ACTIVE) {
            log.warn("Token validation failed: User {} is not active", username);
            return false;
        }
        return true;
    }

    private String formatDisplayName(String roleName) {
        return Arrays.stream(roleName.split("_"))
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }
}
