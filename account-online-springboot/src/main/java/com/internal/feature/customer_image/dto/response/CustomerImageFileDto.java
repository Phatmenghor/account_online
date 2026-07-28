package com.internal.feature.customer_image.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.MediaType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerImageFileDto {
    private byte[] content;
    private MediaType mediaType;
}
