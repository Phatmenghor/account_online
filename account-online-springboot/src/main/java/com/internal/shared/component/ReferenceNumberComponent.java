package com.internal.shared.component;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
public class ReferenceNumberComponent {

    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    /**
     * Generates a request reference based on current timestamp (yyyyMMddHHmmssSSS).
     */
    public String generateTimestampReference() {
        return LocalDateTime.now().format(TIMESTAMP_FORMATTER);
    }

    /**
     * Generates a UUID reference.
     */
    public String generateUuidReference() {
        return UUID.randomUUID().toString();
    }
}
