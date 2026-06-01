package com.internal.feature.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseDto {
    private Long id;
    private String idCard;
    private String email;
    private String userRole;
    private String userStatus;
    private String fullName;
    private String position;
    private String profileUrl;
    private String staffId;
    private String phoneNumber;
    private String branch;
    private String department;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;
}
