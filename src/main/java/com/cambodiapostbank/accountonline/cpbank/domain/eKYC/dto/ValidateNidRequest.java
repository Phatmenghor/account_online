package com.cambodiapostbank.accountonline.cpbank.domain.eKYC.dto;

import lombok.Data;

@Data
public class ValidateNidRequest {
    private String applicationName;
    public String idNumber;
    public String lastNameKh;
    public String firstNameKh;
    public String dob;
    public String gender;
    public String lastNameEn;
    public String firstNameEn;
    public String expiredDate;
    public String issuedDate;
}
