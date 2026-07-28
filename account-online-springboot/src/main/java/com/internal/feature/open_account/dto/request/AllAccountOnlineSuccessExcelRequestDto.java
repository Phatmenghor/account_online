package com.internal.feature.open_account.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AllAccountOnlineSuccessExcelRequestDto {

    @NotNull(message = "From Date is required")
    private LocalDate fromDate;

    @NotNull(message = "To Date is required")
    private LocalDate toDate;

    private String search;
}
