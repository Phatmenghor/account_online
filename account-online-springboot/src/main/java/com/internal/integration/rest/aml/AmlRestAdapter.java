package com.internal.integration.rest.aml;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.internal.config.CpbProperties;
import com.internal.shared.exception.custom.ValidateServiceException;
import com.internal.shared.constant.AppConstants;
import com.internal.feature.open_account.dto.request.CustomerAmlRequest;
import com.internal.feature.open_account.dto.response.AmlExternalResponseDto;
import com.internal.integration.ports.AmlPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AmlRestAdapter implements AmlPort {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AmlRestAdapter.class);

    private final CpbProperties properties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    @Value("${simulator.aml.error:false}")
    private boolean simulateAmlServiceError;

    @Value("${simulator.aml.high-risk:false}")
    private boolean simulateAmlHighRisk;

    public AmlExternalResponseDto checkAml(CustomerAmlRequest requestBody) {

        try {
            if (simulateAmlServiceError) {
                log.error("AML Service Error Simulation Enabled");
                throw new ValidateServiceException(AppConstants.MSG_SYSTEM_BUSY);
            }

            boolean isHighRiskTest = simulateAmlHighRisk || (requestBody != null && requestBody.getCustomerId() != null 
                    && (requestBody.getCustomerId().contains("HIGH") || requestBody.getCustomerId().startsWith("TEST_HIGH")));

            if (isHighRiskTest) {
                log.warn("AML High Risk Simulation Enabled / Triggered for Customer: {} - returning simulated high-risk response", requestBody != null ? requestBody.getCustomerId() : "N/A");
                AmlExternalResponseDto simulated = new AmlExternalResponseDto();
                simulated.setRiskLevel("HIGH");
                simulated.setActionTaken("Review Required");
                simulated.setRulesTriggered("[{\"RuleName\":\"Sanction List Hit\"}]");
                simulated.setServiceName("Simulation");
                simulated.setTotalRulesScore(100);
                simulated.setTrxnID("SIM-" + System.currentTimeMillis());
                log.warn("Simulated AML Response: RiskLevel={}, TrxnID={}", simulated.getRiskLevel(), simulated.getTrxnID());
                return simulated;
            }

            String url = properties.getAml().getUrl();
            String jsonRequest = objectMapper.writeValueAsString(requestBody);
            log.info("[AmlRestAdapter] Initiating AML check. url={}, customerId={}", url, requestBody != null ? requestBody.getCustomerId() : "N/A");

            String credentials = properties.getAml().getUsername() + ":" + properties.getAml().getPassword();
            String encodedCredentials = Base64.getEncoder()
                    .encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(new MediaType(MediaType.APPLICATION_JSON.getType(),
                    MediaType.APPLICATION_JSON.getSubtype(), StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + encodedCredentials);

            String traceId = org.slf4j.MDC.get("traceId");
            if (traceId != null && !traceId.isBlank()) {
                headers.set("X-Request-ID", traceId);
                headers.set("X-Trace-ID", traceId);
            }

            HttpEntity<String> entity = new HttpEntity<>(jsonRequest, headers);

            long startTime = System.currentTimeMillis();
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);
            long duration = System.currentTimeMillis() - startTime;

            String rawBody = response.getBody();
            log.info("AML API Response ({}ms) received", duration);

            if (rawBody == null || rawBody.trim().isEmpty()) {
                throw new RuntimeException("AML Service returned empty response");
            }

            Map<String, Object> map = objectMapper.readValue(rawBody, new TypeReference<Map<String, Object>>() {
            });
            Object rulesArray = map.get("RulesTriggered");
            if (rulesArray == null) {
                rulesArray = map.get("rules_triggered");
            }
            if (rulesArray == null) {
                rulesArray = map.get("rulesTriggered");
            }
            String rulesAsString = rulesArray == null ? "" : objectMapper.writeValueAsString(rulesArray);
            map.put("RulesTriggered", rulesAsString);
            map.put("rules_triggered", rulesAsString);

            AmlExternalResponseDto result = objectMapper.convertValue(map, AmlExternalResponseDto.class);
            log.info("AML Check Completed ({}ms) | RiskLevel: {} | TrxnID: {} | RulesScore: {}",
                    duration, result.getRiskLevel(), result.getTrxnID(), result.getTotalRulesScore());

            return result;

        } catch (Exception e) {
            log.error("AML API call failed: {} | Message: {}", e.getClass().getSimpleName(), e.getMessage(), e);
            throw new ValidateServiceException(AppConstants.MSG_SYSTEM_BUSY);
        }
    }
}