package com.internal.feature.open_account.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenAccountResponseDto {

    private Long historyId;
    private String legalId;
    private String submittedBy;

    // AML result
    private String amlStatus;

    // Created account details
    private String cif;
    private String mnemonic;
    private String khrAccount;
    private String usdAccount;
    private String mbActivationCode;

    // Final result
    private String status;
    private String message;
}
