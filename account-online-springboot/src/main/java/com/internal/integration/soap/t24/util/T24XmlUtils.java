package com.internal.integration.soap.t24.util;

import com.internal.shared.constant.AppConstants;
import com.internal.shared.exception.openaccount.OpenAccountException;
import com.internal.shared.util.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Component
@Slf4j
public class T24XmlUtils {

    private static final DateTimeFormatter T24_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public String safe(String str) {
        return str != null ? xmlEscape(str.trim()) : "";
    }

    public String getOrDefault(String value, String defaultValue) {
        return (value != null && !value.trim().isEmpty()) ? xmlEscape(value.trim()) : defaultValue;
    }

    public String xmlEscape(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    public String toSwiftSafe(String input) {
        if (input == null) return "";
        String cleaned = input.replaceAll("[^a-zA-Z0-9 space/?:().,'+-]", " ");
        return xmlEscape(cleaned.trim());
    }

    public String formatCompanyCode(String branchCode, String defaultBranch) {
        String code = (branchCode != null && !branchCode.trim().isEmpty()) ? branchCode.trim() : defaultBranch;
        if (code != null && code.startsWith("KH")) {
            return code;
        }
        return "KH001" + (code != null ? code : "1011");
    }

    public String mapMaritalStatus(String status) {
        if (status == null || status.isBlank()) return "SINGLE";
        String upper = status.trim().toUpperCase(Locale.ROOT);
        return switch (upper) {
            case "MARRIED" -> "MARRIED";
            case "DIVORCED" -> "DIVORCED";
            case "WIDOWED" -> "WIDOWED";
            default -> "SINGLE";
        };
    }

    public String mapGender(String gender) {
        if (gender == null || gender.isBlank()) return "MALE";
        String g = gender.trim().toUpperCase(Locale.ROOT);
        if (g.startsWith("F") || g.contains("FEMALE") || g.contains("ស្រី")) return "FEMALE";
        return "MALE";
    }

    public String mapLegalDocType(String type, Boolean hasNid) {
        if (type != null && !type.isBlank()) {
            String t = type.trim().toUpperCase(Locale.ROOT);
            if (t.contains("NID") || t.contains("NATIONAL")) return "NATIONAL.ID";
            if (t.contains("BIRTH") || t.contains("CERTIFICATE")) return "BIRTH.CERTIFICATE";
            if (t.contains("PASSPORT")) return "PASSPORT";
            if (t.contains("FAMILY")) return "FAMILY.BOOK";
        }
        return Boolean.TRUE.equals(hasNid) ? "NATIONAL.ID" : "BIRTH.CERTIFICATE";
    }

    public String determineTitle(String gender) {
        if (gender == null || gender.trim().isEmpty()) return "";
        String genderUpper = gender.toUpperCase(Locale.ROOT);
        if (genderUpper.contains(AppConstants.MALE) && !genderUpper.contains(AppConstants.FEMALE)) {
            return AppConstants.MR;
        } else if (genderUpper.contains(AppConstants.FEMALE)) {
            return AppConstants.MS;
        }
        return "";
    }

    public String formatDateForT24(String date) {
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

    public String formatDateForT24NoFutureCheck(String date) {
        if (date != null && !date.trim().isEmpty()) {
            try {
                LocalDate localDate = parseDate(date.trim());
                return localDate.format(T24_DATE_FORMATTER);
            } catch (Exception e) {
                log.warn("Could not format date '{}'", date);
            }
        }
        return "";
    }

    public String formatLegalIssueDate(String date) {
        if (date != null && !date.trim().isEmpty()) {
            try {
                LocalDate localDate = parseDate(date.trim());
                LocalDate maxSafeDate = LocalDate.of(2025, 1, 1);
                if (localDate.isAfter(maxSafeDate)) {
                    localDate = maxSafeDate;
                }
                return localDate.format(T24_DATE_FORMATTER);
            } catch (Exception e) {
                log.warn("Could not parse legal issue date '{}'", date);
            }
        }
        return "20250101";
    }

    public String formatLegalIssueDateWithDefault(String date) {
        return formatLegalIssueDate(date);
    }

    public String formatLegalExpireDate(String date) {
        if (date != null && !date.trim().isEmpty()) {
            try {
                LocalDate localDate = parseDate(date.trim());
                return localDate.format(T24_DATE_FORMATTER);
            } catch (Exception e) {
                log.warn("Could not parse legal expire date '{}'", date);
            }
        }
        return "";
    }

    public String formatLegalExpireDateWithDefault(String date) {
        return formatLegalExpireDate(date);
    }

    public LocalDate parseDate(String dateStr) {
        try {
            if (dateStr.matches("\\d{8}")) {
                return LocalDate.parse(dateStr, T24_DATE_FORMATTER);
            }
            return LocalDate.parse(dateStr, DATE_FORMATTER);
        } catch (Exception e) {
            return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }
    }

    public boolean isAuthenticated() {
        return SecurityUtils.getCurrentUsername() != null;
    }
}
