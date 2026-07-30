package com.internal.feature.sms_otp.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpResponse {

    @Schema(description = "Verification successful")
    private Boolean verified;

    @Schema(description = "Phone number")
    private String phone;

    @Schema(description = "Message")
    private String message;

    @Schema(description = "Guardian CIF")
    private String cif;

    @Schema(description = "Guardian Customer Name")
    private String customerName;
}

