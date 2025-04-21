package com.cambodiapostbank.accountonline.cpbank.domain.eKYC.dto;

import lombok.Data;

@Data
public class ValidateNidResponse {
    public int error;
    public String message;
    public UserInfo data;
}
