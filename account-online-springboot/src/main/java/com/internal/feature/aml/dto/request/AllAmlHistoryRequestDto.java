package com.internal.feature.aml.dto.request;

import com.internal.enumation.AmlStatusEnum;
import com.internal.shared.pagination.BasePaginationFilterRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class AllAmlHistoryRequestDto extends BasePaginationFilterRequest {
    private AmlStatusEnum amlStatus;
    private LocalDate startDate;
    private LocalDate endDate;

    public String getAmlStatusString() {
        if (amlStatus != null) return amlStatus.name();
        if (getStatus() != null && !getStatus().isBlank()) {
            return getStatus().toUpperCase();
        }
        return null;
    }
}
