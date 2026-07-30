package com.internal.feature.sms_otp.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for phone number pre-check against MB Core.
 *
 * hasAccount = true  → phone is already registered in MB Core (warn user)
 * hasAccount = false → phone is not registered yet (safe to proceed)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhoneCheckResponse {

    /** Whether this phone already has an active MB account */
    private Boolean hasAccount;

    @Schema(description = "Customer CIF if found", example = "4000086308")
    private String cif;

    @Schema(description = "Customer Full Name if found", example = "SEANG CHIVA")
    private String customerName;

    @Schema(description = "Mobile number registered in MB", example = "85512345678")
    private String mobile;
}
