package com.internal.feature.master_data.dto.request;

import com.internal.enumation.StatusData;
import com.internal.shared.pagination.BasePaginationFilterRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class GetAllMaritalStatusRequest extends BasePaginationFilterRequest {
    private StatusData statusData;

    public StatusData getStatusData() {
        if (statusData != null) return statusData;
        if (getStatus() != null && !getStatus().isBlank()) {
            try {
                return StatusData.valueOf(getStatus().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        return null;
    }
}
