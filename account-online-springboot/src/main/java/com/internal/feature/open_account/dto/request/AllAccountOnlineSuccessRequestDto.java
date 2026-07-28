package com.internal.feature.open_account.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
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
public class AllAccountOnlineSuccessRequestDto extends BasePaginationFilterRequest {

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fromDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate toDate;
}
