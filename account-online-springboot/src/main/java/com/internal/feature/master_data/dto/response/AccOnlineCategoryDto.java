package com.internal.feature.master_data.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccOnlineCategoryDto {
    private Long id;
    private String category;
    private String lookupCode;
    private String lookupId;
    private String lookupName;
    private String lookupDesc;
}

