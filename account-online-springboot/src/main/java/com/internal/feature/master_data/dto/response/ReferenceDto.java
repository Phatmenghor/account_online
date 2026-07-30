package com.internal.feature.master_data.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.internal.enumation.StatusData;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferenceDto {
    private Long id;
    private String nameEn;
    private String nameKh;
    private StatusData status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

