package com.internal.integration.soap.sms;

import com.internal.integration.ports.SmsPort;
import com.internal.shared.component.SoapComponent;
import com.internal.shared.component.ReferenceNumberComponent;
import com.internal.feature.sms_otp.models.SmsLog;
import com.internal.feature.sms_otp.service.SmsLogService;
import com.internal.config.CpbProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
@Slf4j
public class SmsSoapAdapter implements SmsPort {

    private final SoapComponent soapComponent;
    private final SmsLogService smsLogService;
    private final ReferenceNumberComponent referenceNumberComponent;
    private final CpbProperties properties;

    @org.springframework.beans.factory.annotation.Value("${spring.profiles.active:local}")
    private String activeProfile;

    @Override
    public void sendSms(String phone, String message) {
        sendSms(properties.getMb().getOtpUrl(), properties.getMb().getSecretKey(), phone, message);
    }

    /**
     * Sends an SMS and logs the transaction.
     */
    public void sendSms(String url, String secretKey, String phone, String message) {
        String status = "FAILED";
        String responseCode = null;
        String errorMessage = null;
        String requestId = referenceNumberComponent.generateTimestampReference();

        String cleanedMessage = message;
        if (cleanedMessage != null) {
            cleanedMessage = cleanedMessage.replaceAll("(?i)registCode:\\s*", "").trim();
            cleanedMessage = cleanedMessage.replaceAll(" +", " ");
        }

        // On local and uat environments, bypass actual SOAP network calls to avoid connection errors
        if (activeProfile != null && (activeProfile.contains("local") || activeProfile.contains("uat"))) {
            log.info("[MOCK SMS] Skipping real SOAP call on profile '{}' - Phone: {}, Message: {}", activeProfile, phone, cleanedMessage);
            smsLogService.saveLog(SmsLog.builder()
                    .phone(phone)
                    .message(cleanedMessage)
                    .status("SUCCESS")
                    .responseCode("200")
                    .errorMessage("MOCK_SMS_LOCAL_UAT")
                    .requestId(requestId)
                    .build());
            return;
        }

        try {
            String soapXml = "<?xml version=\"1.0\"?>" +
                    "<soap:Envelope xmlns:soap='http://www.w3.org/2003/05/soap-envelope' xmlns:cpb='http://cpbmobile.vnpay.vn'>" +
                    "<soap:Header/>" +
                    "<soap:Body>" +
                    "<cpb:sendSmsNew>" +
                    "<cpb:requestId>" + requestId + "</cpb:requestId>" +
                    "<cpb:keyword>CPBSMS</cpb:keyword>" +
                    "<cpb:mobileNo>" + phone + "</cpb:mobileNo>" +
                    "<cpb:content><![CDATA[" + cleanedMessage + "]]></cpb:content>" +
                    "<cpb:requestTime></cpb:requestTime>" +
                    "<cpb:contentType>9</cpb:contentType>" +
                    "<cpb:secretKey>" + secretKey + "</cpb:secretKey>" +
                    "</cpb:sendSmsNew>" +
                    "</soap:Body>" +
                    "</soap:Envelope>";

            log.info("[SmsSoapAdapter] Sending SOAP SMS request. phone={}, requestId={}", phone, requestId);
            String responseXml = soapComponent.sendSoapRequest(url, soapXml);

            // Extract <return> JSON payload from SOAP response
            Matcher matcher = Pattern.compile("<(?:\\w+:)?return>(.*?)</(?:\\w+:)?return>").matcher(responseXml);
            String jsonPayload = matcher.find() ? matcher.group(1) : null;

            if (log.isDebugEnabled()) {
                log.debug("[SmsSoapAdapter] SOAP SMS raw response. requestId={}, responseXml={}", requestId, responseXml);
            }

            if (jsonPayload != null && jsonPayload.contains("\"rescode\":\"00\"")) {
                log.info("[SmsSoapAdapter] SMS sent successfully. phone={}, requestId={}", phone, requestId);
            } else {
                log.warn("[SmsSoapAdapter] SMS response indicates possible failure. phone={}, requestId={}, payload={}", phone, requestId, jsonPayload);
            }

            responseCode = "200";
            status = "SUCCESS";

        } catch (Exception ex) {
            errorMessage = ex.getMessage() != null && ex.getMessage().length() > 500
                    ? ex.getMessage().substring(0, 500)
                    : ex.getMessage();
            log.error("Failed to send SMS to {} - {}", phone, ex.getMessage(), ex);
        } finally {
            smsLogService.saveLog(SmsLog.builder()
                    .phone(phone)
                    .message(cleanedMessage)
                    .status(status)
                    .responseCode(responseCode)
                    .errorMessage(errorMessage)
                    .requestId(requestId)
                    .build());
        }
    }
}





