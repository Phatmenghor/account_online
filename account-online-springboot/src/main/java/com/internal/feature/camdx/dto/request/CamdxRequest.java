package com.internal.feature.camdx.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@Data
public class CamdxRequest {

    @JsonProperty("userInfo")
    @Valid
    private CamdxUserInfoRequest userInfo;

    @JsonProperty("faceImg")
    @NotBlank(message = "Face image is required")
    private String faceImg;

    @JsonProperty("idImage")
    @NotBlank(message = "ID image is required")
    private String idImage;
}

