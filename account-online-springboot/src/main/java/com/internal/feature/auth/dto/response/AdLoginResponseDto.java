package com.internal.feature.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AdLoginResponseDto {

    private boolean success;
    private String message;
    private AdUserDto adUser;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AdUserDto {
        private String displayName;
        private String cn;
        private String givenName;
        private String sn;
        private String mail;
        private String department;
        private String title;
        private String telephoneNumber;
        private String mobile;
        private String company;
        private String distinguishedName;
        private List<String> memberOf;
        private String samaccountName;
    }
}
