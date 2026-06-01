package com.internal.feature.auth.dto.request;

import com.internal.enumation.RoleEnum;
import com.internal.enumation.StatusData;
import lombok.Data;

@Data
public class UpdateUserRequestDto {
    private String email;
    private String fullName;
    private StatusData status;
    private String profileUrl;
    private String position;
    private String staffId;
    private String phoneNumber;
    private String branch;
    private String department;
    private RoleEnum userRole;
}
