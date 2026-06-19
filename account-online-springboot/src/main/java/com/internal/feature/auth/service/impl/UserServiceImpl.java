package com.internal.feature.auth.service.impl;

import com.internal.enumation.StatusData;
import com.internal.exceptions.error.custom.BadRequestException;
import com.internal.exceptions.error.custom.NotFoundException;
import com.internal.feature.auth.dto.request.ChangePasswordByAdminRequestDto;
import com.internal.feature.auth.dto.request.ChangePasswordRequestDto;
import com.internal.feature.auth.dto.request.GetAllUserRequestDto;
import com.internal.feature.auth.dto.request.UpdateUserRequestDto;
import com.internal.feature.auth.models.Role;
import com.internal.feature.auth.repository.RoleRepository;
import com.internal.feature.auth.dto.response.AllUserResponseDto;
import com.internal.feature.auth.dto.response.AuthResponseDTO;
import com.internal.feature.auth.dto.response.UserResponseDto;
import com.internal.feature.auth.mapper.UserMapper;
import com.internal.feature.auth.models.UserEntity;
import com.internal.feature.auth.repository.UserRepository;
import com.internal.feature.auth.security.JWTGenerator;
import com.internal.feature.auth.service.UserService;
import com.internal.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.internal.enumation.RoleEnum;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SecurityUtils securityUtils;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final JWTGenerator jwtGenerator;

    @Override
    public AllUserResponseDto getAllUser(GetAllUserRequestDto requestDto) {
        log.debug("Getting users with pageNo={}, pageSize={}, search={}, status={}",
                requestDto.getPageNo(), requestDto.getPageSize(), requestDto.getSearch(), requestDto.getStatus());

        GetAllUserRequestDto userRequestDto = new GetAllUserRequestDto(Math.max(requestDto.getPageNo() - 1, 0),
                Math.max(requestDto.getPageSize(), 1),
                requestDto.getSearch(),
                requestDto.getStatus(),
                null,
                requestDto.getRoles());

        Pageable pageable = PageRequest.of(userRequestDto.getPageNo(), userRequestDto.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserEntity> userPage = fetchUsers(userRequestDto.getSearch(), userRequestDto.getStatus(), userRequestDto.getRoles(), pageable);

        List<UserResponseDto> content = userPage.getContent().stream()
                .map(userMapper::mapToDto)
                .collect(Collectors.toList());

        return userMapper.mapToListDto(content, userPage);
    }

    @Override
    public UserResponseDto getUserById(Long id) {
        log.debug("Getting user by id: {}", id);
        
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User id " + id + " could not be found"));
        
        return userMapper.mapToDto(user);
    }

    @Override
    public UserResponseDto getUserByToken() {
        log.debug("Getting current user by token");
        UserEntity currentUser = securityUtils.getCurrentUser();
        UserResponseDto dto = userMapper.mapToDto(currentUser);
        if (!currentUser.isForcePasswordChange()) {
            if (currentUser.getPasswordChangedAt() == null) {
                dto.setPasswordExpired(true);
            } else {
                LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Phnom_Penh"));
                dto.setPasswordExpired(currentUser.getPasswordChangedAt().isBefore(now.minusMonths(3)));
            }
        }
        return dto;
    }

    @Transactional
    @Override
    public UserResponseDto deleteUserId(Long id) {
        log.info("Deleting user with id: {}", id);
        
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User id " + id + " could not be found"));

        user.getRoles().clear();
        userRepository.deleteById(id);
        
        return userMapper.mapToDto(user);
    }

    @Override
    public UserResponseDto updateUserId(Long id, UpdateUserRequestDto request) {
        log.debug("Updating user with id: {}", id);
        
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User id " + id + " not found"));

        updateUserFields(user, request);
        UserEntity updated = userRepository.save(user);
        
        return userMapper.mapToDto(updated);
    }

    @Override
    public UserResponseDto changePassword(ChangePasswordRequestDto requestDto) {
        UserEntity user = securityUtils.getCurrentUser();
        log.info("Changing password for current user: {}", user.getUsername());

        validateCurrentPassword(requestDto.getCurrentPassword(), user.getPassword());
        validatePasswordMatch(requestDto.getNewPassword(), requestDto.getConfirmNewPassword());

        user.setPassword(passwordEncoder.encode(requestDto.getNewPassword()));
        user.setForcePasswordChange(false);
        user.setPasswordChangedAt(java.time.LocalDateTime.now(java.time.ZoneId.of("Asia/Phnom_Penh")));
        UserEntity userEntity = userRepository.save(user);

        return userMapper.mapToDto(userEntity);
    }

    @Override
    public UserResponseDto changePasswordByAdmin(ChangePasswordByAdminRequestDto requestDto) {
        log.info("Admin changing password for user with id: {}", requestDto.getId());

        UserEntity user = userRepository.findById(requestDto.getId())
                .orElseThrow(() -> new NotFoundException("User with id " + requestDto.getId() + " not found"));

        validatePasswordMatch(requestDto.getNewPassword(), requestDto.getConfirmNewPassword());

        user.setPassword(passwordEncoder.encode(requestDto.getNewPassword()));
        user.setForcePasswordChange(true);
        UserEntity userEntity = userRepository.save(user);

        return userMapper.mapToDto(userEntity);
    }

    @Override
    public AuthResponseDTO forceChangePassword(String newPassword, String confirmNewPassword) {
        UserEntity user = securityUtils.getCurrentUser();
        log.info("Force password change for user: {}", user.getUsername());

        validatePasswordMatch(newPassword, confirmNewPassword);

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setForcePasswordChange(false);
        user.setPasswordChangedAt(LocalDateTime.now(ZoneId.of("Asia/Phnom_Penh")));
        UserEntity saved = userRepository.save(user);

        List<String> roles = saved.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());
        String token = jwtGenerator.generateTokenForUser(saved.getUsername(), roles);

        UserResponseDto dto = userMapper.mapToDto(saved);
        return new AuthResponseDTO(token, dto);
    }

    private Page<UserEntity> fetchUsers(String search, StatusData status, List<String> roles, Pageable pageable) {
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasStatus = status != null;
        boolean hasRoles = roles != null && !roles.isEmpty();

        List<StatusData> statuses = hasStatus ? Collections.singletonList(status) : Arrays.asList(StatusData.ACTIVE, StatusData.INACTIVE, StatusData.DELETE);

        if (hasRoles) {
            List<RoleEnum> roleEnums = roles.stream()
                    .map(role -> {
                        try {
                            return RoleEnum.valueOf(role);
                        } catch (IllegalArgumentException e) {
                            log.warn("Invalid role: {}", role);
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            if (roleEnums.isEmpty()) {
                return Page.empty(pageable);
            }

            return userRepository.searchByMultipleFieldsAndStatusesAndRoles(search, statuses, roleEnums, pageable);
        } else {
            return hasSearch
                    ? userRepository.searchByMultipleFieldsAndStatuses(search, statuses, pageable)
                    : userRepository.findByStatusIn(statuses, pageable);
        }
    }

    private void updateUserFields(UserEntity user, UpdateUserRequestDto request) {
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getStatus() != null) user.setStatus(request.getStatus());
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getProfileUrl() != null) user.setProfileUrl(request.getProfileUrl());
        if (request.getPosition() != null) user.setPosition(request.getPosition());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getBranch() != null) user.setBranch(request.getBranch());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getUserRole() != null) {
            Role role = roleRepository.findByName(request.getUserRole())
                    .orElseThrow(() -> new com.internal.exceptions.error.custom.BadRequestException("Invalid role: " + request.getUserRole()));
            user.getRoles().clear();
            user.getRoles().add(role);
        }
    }

    private void validateCurrentPassword(String currentPassword, String storedPassword) {
        if (!passwordEncoder.matches(currentPassword, storedPassword)) {
            throw new BadRequestException("Current password is incorrect.");
        }
    }

    private void validatePasswordMatch(String newPassword, String confirmPassword) {
        if (!newPassword.equals(confirmPassword)) {
            throw new BadRequestException("New password and confirm password do not match.");
        }
    }
}
