package com.cambodiapostbank.accountonline.cpbank.domain.otp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;

import javax.validation.constraints.NotNull;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SendOtpRequestDto {
    @JsonProperty("phone")
    @NotNull(message = "The phone field is required.")
    private String phoneNumber;
    @JsonProperty("Text")
    private String text;
    @NotNull(message = "The app field is required.")
    @JsonProperty("App")
    private String app;

    public String toJSON() throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.writeValueAsString(this);
    }
}
