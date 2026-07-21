package com.internal.feature.telegram_alerts.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.internal.feature.camdx.dto.request.CamdxValidateNidRequest;

public interface ErrorAlertsCamdxService {
    void checkValidationResponse(JsonNode response, CamdxValidateNidRequest request);
    void sendInfraErrorAlertFromException(CamdxValidateNidRequest request, String rawMessage);
}


