package com.cambodiapostbank.accountonline.cpbank.domain.EKYC.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class EkycUserInfo {
    @JsonProperty("idNumber")
    private String idNumber;

    @JsonProperty("firstNameKh")
    private String firstNameKh;

    @JsonProperty("lastNameKh")
    private String lastNameKh;

    @JsonProperty("firstNameEn")
    private String firstNameEn;

    @JsonProperty("lastNameEn")
    private String lastNameEn;

    @JsonProperty("gender")
    private String gender;

    @JsonProperty("issuedDate")
    private String issuedDate;

    @JsonProperty("dob")
    private String dob;

    @JsonProperty("expiredDate")
    private String expiredDate;

}
