package com.internal.integration.ports;

import com.internal.feature.open_account.dto.request.CustomerAmlRequest;
import com.internal.feature.open_account.dto.response.AmlExternalResponseDto;

public interface AmlPort {
    AmlExternalResponseDto checkAml(CustomerAmlRequest request);
}
