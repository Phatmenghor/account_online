package com.cambodiapostbank.accountonline.cpbank.domain.otp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOTPRequestDto {
    @JsonProperty("phone_number")
    @NotNull(message = "The phone_number field is required.")
    private String phoneNumber;

    @JsonProperty("otp_code")
    @NotNull(message = "The otp_code field is required.")
    private String otpCode;

    public String toJSON() throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
       return objectMapper.writeValueAsString(this);
    }
}
