package com.internal.feature.auth.service.impl;

import com.internal.enumation.RoleEnum;
import com.internal.enumation.StatusData;
import com.internal.feature.auth.dto.request.ChangePasswordByAdminRequestDto;
import com.internal.feature.auth.dto.request.ChangePasswordRequestDto;
import com.internal.feature.auth.dto.request.ForceChangePasswordRequestDto;
import com.internal.feature.auth.dto.request.LoginRequestDto;
import com.internal.feature.auth.dto.request.RegisterInitiateDto;
import com.internal.feature.auth.dto.request.RegisterRequestDto;
import com.internal.feature.auth.dto.request.UpdateUserRequestDto;
import com.internal.feature.auth.dto.response.AuthResponseDTO;
import com.internal.feature.auth.dto.response.UserResponseDto;
import com.internal.shared.exception.custom.BadRequestException;
import com.internal.shared.exception.custom.DuplicateNameException;
import com.internal.shared.exception.custom.ResourceNotFoundException;
import com.internal.shared.exception.custom.UnauthorizedException;
import com.internal.feature.auth.mapper.AuthMapper;
import com.internal.feature.auth.mapper.UserMapper;
import com.internal.feature.auth.models.Role;
import com.internal.feature.auth.models.UserEntity;
import com.internal.feature.auth.repository.RoleRepository;
import com.internal.feature.auth.repository.UserRepository;
import com.internal.shared.security.JWTGenerator;
import com.internal.feature.auth.service.AuthService;
import com.internal.feature.telegram_alerts.service.TelegramService;
import com.internal.shared.component.ClientIpComponent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTGenerator jwtGenerator;
    private final AuthMapper authMapper;
    private final UserMapper userMapper;
    private final TelegramService telegramService;
    private final ClientIpComponent clientIpComponent;

    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    @Transactional
    public AuthResponseDTO login(LoginRequestDto loginDto) {
        log.info("Processing login request for user: {}", loginDto.getUsername());
        String clientIp = clientIpComponent.getClientIp();

        UserEntity userEntity = userRepository.findByUsername(loginDto.getUsername())
                .orElseThrow(() -> {
                    sendLoginFailAlert(loginDto.getUsername(), clientIp, "Account not found");
                    return new UnauthorizedException(
                            "We couldn't find an account with the username \"" + loginDto.getUsername() + "\". "
                            + "Please double-check your username and try again.");
                });

        if (userEntity.getStatus() == StatusData.INACTIVE) {
            log.warn("Login rejected: User {} account is inactive", loginDto.getUsername());
            sendLoginFailAlert(loginDto.getUsername(), clientIp, "Account inactive");
            throw new UnauthorizedException(
                    "Your account \"" + loginDto.getUsername() + "\" is currently inactive. "
                    + "Please contact your administrator to reactivate your account.");
        }

        if (userEntity.getStatus() == StatusData.DELETE) {
            log.warn("Login rejected: User {} account has been deleted", loginDto.getUsername());
            sendLoginFailAlert(loginDto.getUsername(), clientIp, "Account deleted");
            throw new UnauthorizedException(
                    "Your account \"" + loginDto.getUsername() + "\" has been deactivated. "
                    + "Please contact your administrator for further assistance.");
        }

        if (!passwordEncoder.matches(loginDto.getPassword(), userEntity.getPassword())) {
            log.warn("Login failed: Incorrect password for user {}", loginDto.getUsername());
            sendLoginFailAlert(loginDto.getUsername(), clientIp, "Wrong password");
            throw new UnauthorizedException(
                    "The password you entered is incorrect. "
                    + "Please check your password and try again.");
        }

        userEntity.setLastLogin(LocalDateTime.now(ZoneId.of("Asia/Phnom_Penh")));
        userRepository.save(userEntity);

        boolean forceChange = userEntity.isForcePasswordChange();
        boolean passwordExpired = !forceChange && (
                userEntity.getPasswordChangedAt() == null ||
                userEntity.getPasswordChangedAt().isBefore(
                        LocalDateTime.now(ZoneId.of("Asia/Phnom_Penh")).minusMonths(3)));

        List<String> roles = userEntity.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());
        String token = jwtGenerator.generateTokenForUser(userEntity.getUsername(), roles);

        UserResponseDto userDto = authMapper.userToUserResponseDto(userEntity);
        userDto.setLastLogin(userEntity.getLastLogin());
        userDto.setForcePasswordChange(forceChange);
        userDto.setPasswordExpired(passwordExpired);
        log.info("User {} logged in successfully (forceChange={}, passwordExpired={})",
                loginDto.getUsername(), forceChange, passwordExpired);

        return new AuthResponseDTO(token, userDto);
    }

    @Override
    public void logout(String username) {
        log.info("User logged out: {}", username);
    }

    @Override
    @Transactional
    public AuthResponseDTO register(RegisterInitiateDto dto) {
        log.info("Processing registration for ID Card: {}", dto.getIdCard());

        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new BadRequestException(
                    "The passwords you entered do not match. "
                    + "Please make sure both fields contain the same password.");
        }

        if (userRepository.existsByUsername(dto.getIdCard())) {
            throw new DuplicateNameException(
                    "An account with the ID Card \"" + dto.getIdCard() + "\" already exists. "
                    + "Please sign in to your existing account instead.");
        }

        Role role = roleRepository.findByName(RoleEnum.STAFF)
                .orElseThrow(() -> new BadRequestException("STAFF role not found."));

        UserEntity user = new UserEntity();
        user.setUsername(dto.getIdCard());
        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName());
        user.setPosition(dto.getPosition());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setBranch(dto.getBranch());
        user.setDepartment(dto.getDepartment());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setStatus(StatusData.ACTIVE);
        user.setRoles(Collections.singletonList(role));
        user.setPasswordChangedAt(LocalDateTime.now(ZoneId.of("Asia/Phnom_Penh")));
        user.setLastLogin(LocalDateTime.now(ZoneId.of("Asia/Phnom_Penh")));
        userRepository.save(user);

        List<String> roles = Collections.singletonList(RoleEnum.STAFF.name());
        String token = jwtGenerator.generateTokenForUser(user.getUsername(), roles);

        UserResponseDto userDto = authMapper.userToUserResponseDto(user);
        userDto.setLastLogin(user.getLastLogin());
        log.info("Registration completed and user created for ID Card: {}", dto.getIdCard());

        return new AuthResponseDTO(token, userDto);
    }

    @Override
    @Transactional
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
    @Transactional
    public UserResponseDto updateUserProfile(UpdateUserRequestDto requestDto, String name) {
        log.info("Processing update user profile: {}", name);

        UserEntity user = userRepository.findByUsername(name)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (requestDto.getEmail() != null) user.setEmail(requestDto.getEmail());
        if (requestDto.getStatus() != null) user.setStatus(requestDto.getStatus());
        if (requestDto.getFullName() != null) user.setFullName(requestDto.getFullName());
        if (requestDto.getProfileUrl() != null) user.setProfileUrl(requestDto.getProfileUrl());
        if (requestDto.getPosition() != null) user.setPosition(requestDto.getPosition());
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

    private void sendLoginFailAlert(String username, String ip, String reason) {
        try {
            String time = LocalDateTime.now(ZoneId.of("Asia/Phnom_Penh")).format(DT_FMT);
            String msg = "*Login Failed*\n"
                    + "--------------------\n"
                    + "- Username: `" + escapeMarkdown(username) + "`\n"
                    + "- IP: `" + escapeMarkdown(ip) + "`\n"
                    + "- Reason: `" + reason + "`\n"
                    + "--------------------\n"
                    + "- Time: `" + time + "`";
            telegramService.sendToDev(msg);
        } catch (Exception ignored) {
        }
    }

    private String escapeMarkdown(String text) {
        if (text == null) return "";
        return text.replace("_", "\\_").replace("*", "\\*").replace("`", "\\`").replace("~", "\\~");
    }
}



