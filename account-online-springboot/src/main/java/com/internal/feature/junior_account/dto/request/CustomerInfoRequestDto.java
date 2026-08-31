package com.internal.feature.junior_account.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerInfoRequestDto {

    @NotBlank(message = "CIF is required")
    @JsonProperty("cif")
    private String cif;
}
