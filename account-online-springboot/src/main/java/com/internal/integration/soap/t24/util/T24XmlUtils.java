package com.internal.integration.soap.t24.util;

import com.internal.shared.constant.DefaultConstants;
import com.internal.shared.exception.openaccount.OpenAccountException;
import com.internal.shared.util.SecurityUtils;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Reusable utility class for T24 XML building, sanitization, date formatting, and escaping.
 * Shared across OpenAccountXmlBuilder and JuniorAccountXmlBuilder to eliminate duplicate code.
 */
@Slf4j
public final class T24XmlUtils {

    public static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    public static final DateTimeFormatter T24_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    private T24XmlUtils() {
        throw new UnsupportedOperationException("Utility class");
    }

    public static String safe(String value) {
        return value == null ? "" : xmlEscape(value.trim());
    }

    public static String getOrDefault(String value, String defaultValue) {
        return (value != null && !value.trim().isEmpty()) ? value.trim() : defaultValue;
    }

    public static String xmlEscape(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")   // must be first
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&apos;");
    }

    public static String toSwiftSafe(String input) {
        if (input == null) return "";
        String original = input.trim();
        if (original.isEmpty()) return "";

        String sanitized = original
                .replaceAll("[^\\p{ASCII}]", " ")       // Remove non-ASCII characters
                .replaceAll("[\\x00-\\x1F\\x7F]", " ") // Remove control characters
                .replaceAll("[<>\"'&]", " ")            // Remove HTML-like characters
                .replaceAll(" {2,}", " ")               // Collapse spaces
                .trim();

        return sanitized.isEmpty() ? "Address" : sanitized;
    }

    public static String mapMaritalStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return "SINGLE";
        }
        String upper = status.trim().toUpperCase();
        return switch (upper) {
            case "MARRIED" -> "MARRIED";
            case "DIVORCED" -> "DIVORCED";
            case "WIDOWED" -> "WIDOWED";
            default -> "SINGLE";
        };
    }

    public static String determineTitle(String gender) {
        if (gender == null || gender.trim().isEmpty()) return "";
        String genderUpper = gender.toUpperCase();
        if (genderUpper.contains(DefaultConstants.MALE) && !genderUpper.contains(DefaultConstants.FEMALE)) {
            return DefaultConstants.MR;
        } else if (genderUpper.contains(DefaultConstants.FEMALE)) {
            return DefaultConstants.MS;
        }
        return "";
    }

    public static String formatDateForT24(String date) {
        if (date == null || date.trim().isEmpty()) {
            throw new OpenAccountException("INVALID_DATE_OF_BIRTH", "Date of birth is required");
        }
        try {
            LocalDate localDate = parseDate(date.trim());
            LocalDate now = LocalDate.now(ZoneId.of("Asia/Phnom_Penh"));

            if (localDate.isAfter(now)) {
                String currentDate = now.format(DATE_FORMATTER);
                throw new OpenAccountException("FUTURE_DATE_OF_BIRTH",
                        "The date " + localDate.format(DATE_FORMATTER) + " is in the future (current date: " + currentDate + ").");
            }
            return localDate.format(T24_DATE_FORMATTER);
        } catch (OpenAccountException e) {
            throw e;
        } catch (Exception e) {
            throw new OpenAccountException("INVALID_DATE_FORMAT", "Invalid date format: " + date);
        }
    }

    public static String formatDateForT24NoFutureCheck(String date) {
        if (date != null && !date.trim().isEmpty()) {
            try {
                LocalDate localDate = parseDate(date.trim());
                return localDate.format(T24_DATE_FORMATTER);
            } catch (Exception e) {
                log.warn("Could not format date '{}', using fallback +10 years", date);
            }
        }
        return LocalDate.now().plusYears(10).format(T24_DATE_FORMATTER);
    }

    public static String formatLegalIssueDateWithDefault(String date) {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Phnom_Penh"));
        LocalDate maxAllowed = today.minusYears(1);
        if (date != null && !date.trim().isEmpty()) {
            try {
                LocalDate localDate = parseDate(date.trim());
                if (!localDate.isAfter(maxAllowed)) {
                    return localDate.format(T24_DATE_FORMATTER);
                }
            } catch (Exception ignored) {}
        }
        return maxAllowed.format(T24_DATE_FORMATTER);
    }

    public static LocalDate parseDate(String dateStr) {
        try {
            if (dateStr.matches("\\d{8}")) {
                return LocalDate.parse(dateStr, T24_DATE_FORMATTER);
            }
            return LocalDate.parse(dateStr, DATE_FORMATTER);
        } catch (Exception e) {
            return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }
    }

    public static boolean isAuthenticated() {
        return SecurityUtils.getCurrentUsername() != null;
    }
}
