package com.internal.feature.aml.dto.request;

import com.internal.enumation.AmlStatusEnum;
import com.internal.shared.pagination.BasePaginationFilterRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class AllAmlRequestDto extends BasePaginationFilterRequest {
    private AmlStatusEnum amlStatus;

    public String getAmlStatusString() {
        if (amlStatus != null) return amlStatus.name();
        if (getStatus() != null && !getStatus().isBlank()) {
            return getStatus().toUpperCase();
        }
        return null;
    }
}
