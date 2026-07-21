package com.internal.feature.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopAmlActionUserResponse {
    private Long userId;
    private String fullName;
    private String position;
    private String profileUrl;
    private String branch;
    private long approveCount;
    private long rejectCount;
    private long totalCount;
}

