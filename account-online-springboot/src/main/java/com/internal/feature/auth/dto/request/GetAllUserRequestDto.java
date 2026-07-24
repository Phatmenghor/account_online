package com.internal.feature.auth.dto.request;

import com.internal.enumation.StatusData;
import com.internal.shared.pagination.BasePaginationFilterRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.Collections;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class GetAllUserRequestDto extends BasePaginationFilterRequest {

    private StatusData userStatus;
    private String role;
    private List<String> roles;

    public List<String> getRoles() {
        if (roles != null && !roles.isEmpty()) return roles;
        if (role != null && !role.isBlank()) return Collections.singletonList(role);
        return null;
    }

    public StatusData getStatusData() {
        if (userStatus != null) return userStatus;
        if (getStatus() != null && !getStatus().isBlank()) {
            try {
                return StatusData.valueOf(getStatus().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        return null;
    }
}
