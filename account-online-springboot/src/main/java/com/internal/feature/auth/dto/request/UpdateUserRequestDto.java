package com.internal.feature.auth.dto.request;

import com.internal.enumation.StatusData;
import lombok.Data;

@Data
public class UpdateUserRequestDto {
    private String username;
    private String fullName;
    private String staffId;
    private String phoneNumber;
    private StatusData status;
    private String profileUrl;
    private String position;
}
