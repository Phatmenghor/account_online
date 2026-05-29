package com.internal.feature.auth.service.impl;

import com.internal.enumation.RoleEnum;
import com.internal.enumation.StatusData;
import com.internal.exceptions.error.custom.*;
import com.internal.feature.auth.dto.request.LoginRequestDto;
import com.internal.feature.auth.dto.request.RegisterRequestDto;
import com.internal.feature.auth.dto.request.UpdateUserRequestDto;
import com.internal.feature.auth.dto.request.VerifyEmailRequestDto;
import com.internal.feature.auth.dto.response.AuthResponseDTO;
import com.internal.feature.auth.dto.response.UserResponseDto;
import com.internal.feature.auth.mapper.AuthMapper;
import com.internal.feature.auth.mapper.UserMapper;
import com.internal.feature.auth.models.Role;
import com.internal.feature.auth.models.UserEntity;
import com.internal.feature.auth.repository.RoleRepository;
import com.internal.feature.auth.repository.UserRepository;
import com.internal.feature.auth.security.JWTGenerator;
import com.internal.feature.auth.service.AuthService;
import com.internal.feature.auth.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTGenerator jwtGenerator;
    private final AuthMapper authMapper;
    private final UserMapper userMapper;
    private final EmailService emailService;

    private static final int VERIFICATION_CODE_EXPIRY_MINUTES = 5;

    @Override
    public AuthResponseDTO login(LoginRequestDto loginDto) {
        log.info("Processing login request for user: {}", loginDto.getUsername());

        UserEntity userEntity = userRepository.findByUsername(loginDto.getUsername())
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found with username: {}", loginDto.getUsername());
                    return new NotFoundException("User not found");
                });

        if (!userEntity.isEmailVerified()) {
            log.warn("Login rejected: Email not verified for user: {}", loginDto.getUsername());
            throw new UnauthorizedException("Email not verified. Please verify your email before logging in.");
        }

        if (userEntity.getStatus() != StatusData.ACTIVE) {
            log.warn("Login rejected: User {} is not active. Current status: {}",
                    loginDto.getUsername(), userEntity.getStatus());
            throw new UnauthorizedException("Account is not active. Please contact an administrator.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.getUsername(),
                        loginDto.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtGenerator.generateToken(authentication);

        userEntity.setLastLogin(LocalDateTime.now(ZoneId.of("UTC")));
        userRepository.save(userEntity);

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
    public UserResponseDto register(RegisterRequestDto registerDto) {
        log.info("Processing registration request for email: {}", registerDto.getUsername());

        if (userRepository.existsByUsername(registerDto.getUsername())) {
            log.warn("Registration failed: Email already in use: {}", registerDto.getUsername());
            throw new DuplicateNameException("Email is already registered. Please use a different email.");
        }

        Role role = resolveRole(registerDto.getRole(), registerDto.getUsername(), "Registration");

        String verificationCode = generateVerificationCode();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(VERIFICATION_CODE_EXPIRY_MINUTES);

        UserEntity user = new UserEntity();
        user.setUsername(registerDto.getUsername());
        user.setFullName(registerDto.getFullName());
        user.setStaffId(registerDto.getStaffId());
        user.setPhoneNumber(registerDto.getPhoneNumber());
        user.setPosition(registerDto.getPosition());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        user.setStatus(StatusData.PENDING);
        user.setEmailVerified(false);
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiry(expiry);
        user.setRoles(Collections.singletonList(role));

        userRepository.save(user);

        emailService.sendVerificationEmail(registerDto.getUsername(), registerDto.getFullName(), verificationCode);

        log.info("Registration successful for: {}. Verification email sent.", registerDto.getUsername());
        return authMapper.userToUserResponseDto(user);
    }

    @Override
    public void verifyEmail(VerifyEmailRequestDto requestDto) {
        String email = requestDto.getEmail();
        log.info("Email verification attempt for: {}", email);

        UserEntity user = userRepository.findByUsername(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.isEmailVerified()) {
            log.info("Email already verified for: {}", email);
            return;
        }

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(requestDto.getCode())) {
            log.warn("Invalid verification code for: {}", email);
            throw new BadRequestException("Invalid verification code.");
        }

        if (user.getVerificationCodeExpiry() == null ||
                LocalDateTime.now().isAfter(user.getVerificationCodeExpiry())) {
            log.warn("Expired verification code for: {}", email);
            throw new BadRequestException("Verification code has expired. Please request a new one.");
        }

        user.setEmailVerified(true);
        user.setStatus(StatusData.ACTIVE);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userRepository.save(user);

        log.info("Email verified successfully for: {}", email);
    }

    @Override
    public void resendVerificationCode(String email) {
        log.info("Resend verification code for: {}", email);

        UserEntity user = userRepository.findByUsername(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified.");
        }

        String code = generateVerificationCode();
        user.setVerificationCode(code);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(VERIFICATION_CODE_EXPIRY_MINUTES));
        userRepository.save(user);

        emailService.sendVerificationEmail(email, user.getFullName(), code);
        log.info("Verification code resent to: {}", email);
    }

    @Override
    public UserResponseDto createUserByAdmin(RegisterRequestDto registerDto) {
        log.info("Processing admin user creation for email: {}", registerDto.getUsername());

        if (userRepository.existsByUsername(registerDto.getUsername())) {
            log.warn("Admin creation failed: Email already in use: {}", registerDto.getUsername());
            throw new DuplicateNameException("Email is already registered.");
        }

        Role role = resolveRole(registerDto.getRole(), registerDto.getUsername(), "Admin creation");

        UserEntity user = new UserEntity();
        user.setUsername(registerDto.getUsername());
        user.setFullName(registerDto.getFullName());
        user.setStaffId(registerDto.getStaffId());
        user.setPhoneNumber(registerDto.getPhoneNumber());
        user.setPosition(registerDto.getPosition());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        user.setStatus(StatusData.ACTIVE);
        user.setEmailVerified(true);
        user.setRoles(Collections.singletonList(role));

        UserEntity savedUser = userRepository.save(user);
        log.info("Admin creation successful: {}", registerDto.getUsername());
        return authMapper.userToUserResponseDto(savedUser);
    }

    @Override
    public UserResponseDto updateUserProfile(UpdateUserRequestDto requestDto, String name) {
        log.info("Processing update user profile: {}", name);

        UserEntity user = userRepository.findByUsername(name)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        updateUserFields(user, requestDto);
        UserEntity updatedUser = userRepository.save(user);
        return userMapper.mapToDto(updatedUser);
    }

    private void updateUserFields(UserEntity user, UpdateUserRequestDto request) {
        if (request.getUsername() != null) {
            if (!user.getUsername().equals(request.getUsername()) &&
                    userRepository.existsByUsername(request.getUsername())) {
                throw new DuplicateNameException("Email is already in use.");
            }
            user.setUsername(request.getUsername());
        }
        if (request.getStatus() != null) user.setStatus(request.getStatus());
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getProfileUrl() != null) user.setProfileUrl(request.getProfileUrl());
        if (request.getPosition() != null) user.setPosition(request.getPosition());
    }

    @Override
    public List<Map<String, Object>> getAvailableRoles() {
        log.debug("Fetching available roles");
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
        log.debug("Validating token for user: {}", username);

        Optional<UserEntity> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent() && userOpt.get().getStatus() != StatusData.ACTIVE) {
            log.warn("Token validation failed: User {} is not active", username);
            return false;
        }
        return true;
    }

    private Role resolveRole(RoleEnum roleEnum, String username, String operationType) {
        if (roleEnum == null) {
            roleEnum = RoleEnum.USER;
        }
        RoleEnum finalRoleEnum = roleEnum;
        return roleRepository.findByName(roleEnum)
                .orElseThrow(() -> {
                    log.warn("{} failed: Invalid role {} for user {}", operationType, finalRoleEnum, username);
                    return new BadRequestException("Invalid role: " + finalRoleEnum);
                });
    }

    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    private String formatDisplayName(String roleName) {
        return Arrays.stream(roleName.split("_"))
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }
}
