package com.internal.feature.sms_otp.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PhoneCheckResponse {

    /** Whether this phone already has an active MB account */
    private Boolean hasAccount;

    /** CIF number (only present when hasAccount = true) */
    private String cif;

    /** Mobile number as stored in MB Core (only present when hasAccount = true) */
    private String mobile;
}
