package com.internal.feature.sms_otp.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhoneCheckRequest {

    @NotBlank(message = "Phone number is required")
    @JsonProperty("phone")
    @JsonAlias({"phone", "phoneNumber", "phone_number"})
    private String phone;
}
