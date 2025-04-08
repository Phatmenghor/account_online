package com.cambodiapostbank.accountonline.cpbank.domain.eKYC.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class EkycRequestDataDTO {
    @JsonProperty("userInfo")
    private EkycUserInfo userInfo;

    @JsonProperty("faceImg")
    private String faceImg;

    @JsonProperty("idImage")
    private String idImage;
}
