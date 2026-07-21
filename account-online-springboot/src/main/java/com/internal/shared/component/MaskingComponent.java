package com.internal.shared.component;

import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class MaskingComponent {

    private static final Pattern SENSITIVE_FIELDS_PATTERN = Pattern.compile(
            "\"(password|secret|token|jwt|apiKey|secretKey|pin|idCard|phoneNumber|email)\"\\s*:\\s*\"([^\"]+)\"",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * Finds sensitive keys inside JSON string payloads and masks their values.
     */
    public String maskJsonPayload(String json) {
        if (json == null || json.isEmpty()) {
            return json;
        }
        try {
            Matcher matcher = SENSITIVE_FIELDS_PATTERN.matcher(json);
            StringBuilder sb = new StringBuilder();
            while (matcher.find()) {
                String fieldName = matcher.group(1);
                String value = matcher.group(2);
                String maskedValue = maskValue(fieldName, value);
                String replacement = Matcher.quoteReplacement("\"" + fieldName + "\":\"" + maskedValue + "\"");
                matcher.appendReplacement(sb, replacement);
            }
            matcher.appendTail(sb);
            return sb.toString();
        } catch (Exception e) {
            return json;
        }
    }

    private String maskValue(String fieldName, String value) {
        if (value == null) return null;
        if ("password".equalsIgnoreCase(fieldName) || "pin".equalsIgnoreCase(fieldName)) {
            return "********";
        }
        if (value.length() <= 4) {
            return "****";
        }
        return value.substring(0, 2) + "****" + value.substring(value.length() - 2);
    }
}
