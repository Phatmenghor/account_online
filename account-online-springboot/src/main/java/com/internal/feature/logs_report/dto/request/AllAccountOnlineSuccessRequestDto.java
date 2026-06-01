package com.internal.feature.logs_report.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}
