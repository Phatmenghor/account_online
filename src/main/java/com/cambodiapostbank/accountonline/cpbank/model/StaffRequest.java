package com.cambodiapostbank.accountonline.cpbank.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class StaffRequest {
    @JsonProperty("id_card")
    private String idCard;

    @JsonProperty("password")
    private String password;
}
