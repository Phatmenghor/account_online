package com.internal.feature.master_data.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AccOnlineCategoryDto {
    private Long id;
    private String category;
    private String lookupCode;
    private String lookupId;
    private String lookupName;
    private String lookupDesc;
}
