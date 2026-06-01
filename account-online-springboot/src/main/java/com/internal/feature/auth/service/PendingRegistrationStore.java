package com.internal.feature.auth.service;

import com.internal.feature.auth.dto.request.RegisterInitiateDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class PendingRegistrationStore {

    private static final int EXPIRY_MINUTES = 10;

    private record PendingEntry(RegisterInitiateDto data, LocalDateTime createdAt) {
        boolean isExpired() {
            return LocalDateTime.now().isAfter(createdAt.plusMinutes(EXPIRY_MINUTES));
        }
    }

    private final ConcurrentHashMap<String, PendingEntry> store = new ConcurrentHashMap<>();

    public void put(String email, RegisterInitiateDto data) {
        store.put(email.toLowerCase(), new PendingEntry(data, LocalDateTime.now()));
        log.debug("Stored pending registration for: {}", email);
    }

    public Optional<RegisterInitiateDto> get(String email) {
        PendingEntry entry = store.get(email.toLowerCase());
        if (entry == null || entry.isExpired()) {
            store.remove(email.toLowerCase());
            return Optional.empty();
        }
        return Optional.of(entry.data());
    }

    public void remove(String email) {
        store.remove(email.toLowerCase());
        log.debug("Removed pending registration for: {}", email);
    }
}
