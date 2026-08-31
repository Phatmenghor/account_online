package com.internal.shared.component;

import com.internal.feature.auth.models.UserEntity;
import com.internal.feature.auth.repository.UserRepository;
import com.internal.shared.exception.custom.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditComponent {

    private final UserRepository userRepository;

    /**
     * Resolves current user optionally without logging ERROR stack traces for unauthenticated public requests.
     */
    public Optional<UserEntity> getCurrentUserOptional() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            log.debug("No authenticated user in SecurityContext (public request)");
            return Optional.empty();
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username);
    }

    /**
     * Resolves the currently authenticated user entity or throws NotFoundException.
     */
    public UserEntity getCurrentUser() {
        return getCurrentUserOptional().orElseThrow(() -> {
            log.warn("Authenticated user entity not found in database.");
            return new NotFoundException("User not authenticated or not found.");
        });
    }
}
