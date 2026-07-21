package com.internal.shared.component;

import org.springframework.stereotype.Component;

@Component
public class ErrorComponent {

    /**
     * Sanitizes error message to prevent overly long strings in logs or response bodies.
     */
    public String cleanErrorMessage(String message) {
        if (message == null) return "Unknown error";
        if (message.length() > 500) {
            return message.substring(0, 500) + "...";
        }
        return message;
    }
}
