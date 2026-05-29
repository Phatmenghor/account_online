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
import com.internal.feature.auth.service.EmailService;
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

    @Override
    public AuthResponseDTO login(LoginRequestDto loginDto) {
        log.info("Processing login request for user: {}", loginDto.getUsername());

        UserEntity userEntity = userRepository.findByUsername(loginDto.getUsername())
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found with username: {}", loginDto.getUsername());
                    return new NotFoundException("User not found");
                });

        if (userEntity.getStatus() != StatusData.ACTIVE) {
            log.warn("Login rejected: User {} is not active", loginDto.getUsername());
            throw new UnauthorizedException("Account is deleted. Please contact an administrator.");
        }

        if (!userEntity.isEmailVerified()) {
            log.warn("Login rejected: Email not verified for user {}", loginDto.getUsername());
            throw new UnauthorizedException("Email is not verified. Please verify your email before logging in.");
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
            throw new DuplicateNameException("Email is already in use, please choose another one.");
        }

        Role role = roleRepository.findByName(registerDto.getRole())
                .orElseThrow(() -> {
                    log.warn("Registration failed: Invalid role provided: {}", registerDto.getRole());
                    return new BadRequestException("Invalid role provided: " + registerDto.getRole());
                });

        String verificationCode = generateVerificationCode();
        LocalDateTime expiry = LocalDateTime.now(ZoneId.of("UTC")).plusMinutes(10);

        UserEntity user = new UserEntity();
        user.setUsername(registerDto.getUsername());
        user.setFullName(registerDto.getFullName());
        user.setPosition(registerDto.getPosition());
        user.setStaffId(registerDto.getStaffId());
        user.setPhoneNumber(registerDto.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        user.setStatus(StatusData.ACTIVE);
        user.setEmailVerified(false);
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiry(expiry);
        user.setRoles(Collections.singletonList(role));

        userRepository.save(user);
        emailService.sendVerificationEmail(registerDto.getUsername(), verificationCode);

        log.info("Registration successful for email: {}. Verification email sent.", registerDto.getUsername());
        return authMapper.userToUserResponseDto(user);
    }

    @Override
    public UserResponseDto createUserByAdmin(RegisterRequestDto registerDto) {
        log.info("Processing admin user creation for email: {}", registerDto.getUsername());

        if (userRepository.existsByUsername(registerDto.getUsername())) {
            log.warn("Admin creation failed: Email already in use: {}", registerDto.getUsername());
            throw new DuplicateNameException("Email is already in use, please choose another one.");
        }

        Role role = roleRepository.findByName(registerDto.getRole())
                .orElseThrow(() -> {
                    log.warn("Admin creation failed: Invalid role: {}", registerDto.getRole());
                    return new BadRequestException("Invalid role provided: " + registerDto.getRole());
                });

        UserEntity user = new UserEntity();
        user.setUsername(registerDto.getUsername());
        user.setFullName(registerDto.getFullName());
        user.setPosition(registerDto.getPosition());
        user.setStaffId(registerDto.getStaffId());
        user.setPhoneNumber(registerDto.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        user.setStatus(StatusData.ACTIVE);
        user.setEmailVerified(true);
        user.setRoles(Collections.singletonList(role));

        UserEntity savedUser = userRepository.save(user);
        log.info("Admin creation successful for email: {}", registerDto.getUsername());
        return authMapper.userToUserResponseDto(savedUser);
    }

    @Override
    public void verifyEmail(VerifyEmailRequestDto request) {
        log.info("Processing email verification for: {}", request.getUsername());

        UserEntity user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.isEmailVerified()) {
            log.info("Email already verified for: {}", request.getUsername());
            return;
        }

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(request.getCode())) {
            log.warn("Invalid verification code for user: {}", request.getUsername());
            throw new BadRequestException("Invalid verification code.");
        }

        if (user.getVerificationCodeExpiry() == null ||
                LocalDateTime.now(ZoneId.of("UTC")).isAfter(user.getVerificationCodeExpiry())) {
            log.warn("Expired verification code for user: {}", request.getUsername());
            throw new BadRequestException("Verification code has expired. Please request a new one.");
        }

        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userRepository.save(user);

        log.info("Email verified successfully for: {}", request.getUsername());
    }

    @Override
    public UserResponseDto updateUserProfile(UpdateUserRequestDto requestDto, String name) {
        log.info("Processing update user profile: {}", name);

        UserEntity user = userRepository.findByUsername(name)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (requestDto.getUsername() != null) {
            validateUniqueUsername(user, requestDto.getUsername());
            user.setUsername(requestDto.getUsername());
        }
        if (requestDto.getStatus() != null) user.setStatus(requestDto.getStatus());
        if (requestDto.getFullName() != null) user.setFullName(requestDto.getFullName());
        if (requestDto.getProfileUrl() != null) user.setProfileUrl(requestDto.getProfileUrl());
        if (requestDto.getPosition() != null) user.setPosition(requestDto.getPosition());
        if (requestDto.getStaffId() != null) user.setStaffId(requestDto.getStaffId());
        if (requestDto.getPhoneNumber() != null) user.setPhoneNumber(requestDto.getPhoneNumber());

        UserEntity updatedUser = userRepository.save(user);
        return userMapper.mapToDto(updatedUser);
    }

    private void validateUniqueUsername(UserEntity user, String newUsername) {
        if (!user.getUsername().equals(newUsername) && userRepository.existsByUsername(newUsername)) {
            throw new DuplicateNameException("Email is already in use, please choose another one.");
        }
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
