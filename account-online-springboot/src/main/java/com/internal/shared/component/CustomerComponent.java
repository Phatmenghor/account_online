package com.internal.shared.component;

import org.springframework.stereotype.Component;

@Component
public class CustomerComponent {

    /**
     * Cleans the legal ID by trimming and removing the OAO prefix if present.
     */
    public String cleanLegalId(String legalId) {
        if (legalId == null) return null;
        String cleaned = legalId.trim();
        if (cleaned.toUpperCase().startsWith("OAO")) {
            return cleaned.substring(3);
        }
        return cleaned;
    }

    /**
     * Checks if the legal ID has the OAO prefix.
     */
    public boolean isOaoId(String legalId) {
        return legalId != null && legalId.toUpperCase().startsWith("OAO");
    }
}
