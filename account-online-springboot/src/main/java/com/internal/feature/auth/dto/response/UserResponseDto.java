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
    private String idCard; // the email used as username
    private String userRole;
    private String userStatus;
    private String fullName;
    private String position;
    private String profileUrl;
    private String staffId;
    private String phoneNumber;
    private BranchInfo branch;
    private boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchInfo {
        private Long id;
        private String branchCode;
        private String branchKh;
    }
}
