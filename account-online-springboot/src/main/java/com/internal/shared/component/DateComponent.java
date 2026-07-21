package com.internal.shared.component;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class DateComponent {

    /**
     * Formats a LocalDateTime object with the specified pattern.
     */
    public String format(LocalDateTime dateTime, String pattern) {
        if (dateTime == null) return null;
        return dateTime.format(DateTimeFormatter.ofPattern(pattern));
    }

    /**
     * Formats a LocalDate object with the specified pattern.
     */
    public String format(LocalDate date, String pattern) {
        if (date == null) return null;
        return date.format(DateTimeFormatter.ofPattern(pattern));
    }

    /**
     * Parses a date string using the specified pattern to LocalDate.
     */
    public LocalDate parseLocalDate(String dateStr, String pattern) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern(pattern));
    }

    /**
     * Parses a date-time string using the specified pattern to LocalDateTime.
     */
    public LocalDateTime parseLocalDateTime(String dateStr, String pattern) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        return LocalDateTime.parse(dateStr, DateTimeFormatter.ofPattern(pattern));
    }
}
