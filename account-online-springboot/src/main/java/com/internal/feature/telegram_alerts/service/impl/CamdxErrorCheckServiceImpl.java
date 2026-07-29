package com.internal.feature.telegram_alerts.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.internal.feature.camdx.dto.request.CamdxValidateNidRequest;
import com.internal.feature.telegram_alerts.service.ErrorAlertsCamdxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CamdxErrorCheckServiceImpl implements ErrorAlertsCamdxService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void checkValidationResponse(JsonNode response, CamdxValidateNidRequest request) {
        String idNumber = request.getIdNumber();
        log.info("Checking CAMDX validation result for ID: {}", idNumber);

        try {
            if (response == null || response.isEmpty()) {
                log.warn("Empty CAMDX response for ID {}", idNumber);
                return;
            }

            int errorCode = response.path("error").asInt(0);
            String message = response.path("message").asText("Unknown");

            if (errorCode != 0) {
                log.error("CAMDX API ERROR for ID {} - ErrorCode: {} | Message: {}", idNumber, errorCode, message);
                return;
            }

            JsonNode data = response.path("data");
            double score = data.path("score").asDouble(1.0);
            List<String> incorrectFields = objectMapper.convertValue(
                    data.path("incorrectFields"),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));

            boolean validationFailed = score < 1 || (incorrectFields != null && !incorrectFields.isEmpty());

            if (validationFailed) {
                log.warn("CAMDX VALIDATION FAILURE for ID {} | Score: {} | IncorrectFields: {}",
                        idNumber, score, incorrectFields);
            } else {
                log.info("CAMDX validation success for ID {}", idNumber);
            }
        } catch (Exception e) {
            log.error("Unexpected exception during CAMDX validation for ID: {}", idNumber, e);
        }
    }

    @Override
    public void sendInfraErrorAlertFromException(CamdxValidateNidRequest request, String rawMessage) {
        log.error("CAMDX EXCEPTION for ID {} | Message: {}", request != null ? request.getIdNumber() : "UNKNOWN", rawMessage);
    }
}
