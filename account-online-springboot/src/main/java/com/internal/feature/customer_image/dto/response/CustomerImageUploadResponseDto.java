package com.internal.feature.customer_image.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerImageUploadResponseDto {
    private String nidImagePath;
    private String selfieImagePath;
}


