package com.internal.shared.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class DateUtils {

    private DateUtils() {
        // Prevent instantiation
    }

    /**
     * Formats a LocalDateTime object.
     */
    public static String format(LocalDateTime dateTime, String pattern) {
        if (dateTime == null) return null;
        return dateTime.format(DateTimeFormatter.ofPattern(pattern));
    }

    /**
     * Formats a LocalDate object.
     */
    public static String format(LocalDate date, String pattern) {
        if (date == null) return null;
        return date.format(DateTimeFormatter.ofPattern(pattern));
    }
}
