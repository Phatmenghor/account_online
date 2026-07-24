package com.internal.feature.auth.dto.request;

import com.internal.enumation.StatusData;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.jackson.Jacksonized;

import java.util.Collections;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Jacksonized
public class GetAllUserRequestDto {

    @Schema(example = "1", defaultValue = "1")
    @Builder.Default
    private int pageNo = 1;

    @Schema(example = "10", defaultValue = "10")
    @Builder.Default
    private int pageSize = 10;

    private String search;
    @Builder.Default
    private StatusData status = StatusData.ACTIVE;
    private String role;
    private List<String> roles;

    public List<String> getRoles() {
        if (roles != null && !roles.isEmpty()) return roles;
        if (role != null && !role.isBlank()) return Collections.singletonList(role);
        return null;
    }
}

