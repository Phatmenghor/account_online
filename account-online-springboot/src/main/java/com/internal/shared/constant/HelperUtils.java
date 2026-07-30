package com.internal.shared.constant;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class HelperUtils {

    public static String formatCodeWithLeadingZero(String code, int length) {
        if (code == null || code.isBlank()) {
            return code;
        }
        try {
            int numeric = Integer.parseInt(code.trim());
            return String.format("%0" + length + "d", numeric);
        } catch (NumberFormatException e) {
            return code;
        }
    }
}
