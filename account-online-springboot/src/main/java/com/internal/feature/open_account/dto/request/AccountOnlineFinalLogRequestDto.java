package com.internal.feature.open_account.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountOnlineFinalLogRequestDto {
    private String legalId;
    private String cif;
}
