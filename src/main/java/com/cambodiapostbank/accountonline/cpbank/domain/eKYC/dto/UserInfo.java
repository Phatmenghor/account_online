package com.cambodiapostbank.accountonline.cpbank.domain.eKYC.dto;

import lombok.Data;

import java.util.ArrayList;

@Data
public class UserInfo {
    public String idNumber;
    public double score;
    public ArrayList<String> incorrectFields;
}