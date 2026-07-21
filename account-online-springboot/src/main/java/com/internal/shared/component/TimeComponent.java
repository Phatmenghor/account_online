package com.internal.shared.component;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class TimeComponent {

    /**
     * Calculates duration in seconds between two LocalDateTime objects.
     */
    public long getDurationInSeconds(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) return 0;
        return Duration.between(start, end).getSeconds();
    }

    /**
     * Calculates duration in minutes between two LocalDateTime objects.
     */
    public long getDurationInMinutes(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) return 0;
        return Duration.between(start, end).toMinutes();
    }
}
