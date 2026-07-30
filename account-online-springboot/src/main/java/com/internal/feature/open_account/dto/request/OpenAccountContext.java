package com.internal.feature.open_account.dto.request;

import com.internal.feature.aml.dto.response.AmlStatusDto;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OpenAccountContext {
    private CustomerRequest request;
    private Map<String, String> customerInfo;
    private AmlStatusDto amlResult;
    private String cif;
    private String mnemonic;
    private String khrAccount;
    private String usdAccount;
    private String mbActivationCode;
    private String submittedBy;
}

