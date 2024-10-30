package com.cambodiapostbank.accountonline.cpbank.domain.customer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponseDto {
    @JsonProperty("ErrCode")
    private String errorCode;
    @JsonProperty("ErrMsg")
    private String errorMessage;
    @JsonProperty("Content")
    private String content;
}
