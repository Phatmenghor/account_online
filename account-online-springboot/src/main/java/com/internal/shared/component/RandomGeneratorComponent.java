package com.internal.shared.component;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

@Component
public class RandomGeneratorComponent {

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generates a secure random token encoded in Base64.
     */
    public String generateSecureToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }

    /**
     * Returns a random value between 0 (inclusive) and bound (exclusive).
     */
    public int nextInt(int bound) {
        return secureRandom.nextInt(bound);
    }
}
