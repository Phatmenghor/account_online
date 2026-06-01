package com.internal.feature.logs_report.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AllAccountOnlineSuccessRequestDto {

    @Schema(example = "1", defaultValue = "1")
    @Builder.Default
    private int pageNo = 1;

    @Schema(example = "10", defaultValue = "10")
    @Builder.Default
    private int pageSize = 10;

    private String search;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fromDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate toDate;
}
