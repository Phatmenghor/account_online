package com.cambodiapostbank.accountonline.cpbank.domain.staff_info;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class StaffRequestDTO {
    @JsonProperty("id_card")
    private String idCard;

    @JsonProperty("password")
    private String password;
}
