package com.internal.feature.auth.service.impl;

import com.internal.config.JwtProperties;
import com.internal.feature.auth.models.RefreshToken;
import com.internal.feature.auth.models.UserEntity;
import com.internal.feature.auth.repository.RefreshTokenRepository;
import com.internal.feature.auth.service.RefreshTokenService;
import com.internal.shared.security.JWTGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JWTGenerator jwtGenerator;
    private final JwtProperties jwtProperties;

    @Override
    @Transactional
    public RefreshToken createRefreshToken(UserEntity user, String ipAddress, String deviceInfo) {
        List<String> roles = user.getRoles().stream()
                .map(r -> "ROLE_" + r.getName().name().toUpperCase())
                .collect(java.util.stream.Collectors.toList());

        String tokenString = jwtGenerator.generateRefreshTokenForUser(user.getUsername(), roles);
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(jwtProperties.getRefreshTokenExpirationMin());

        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenString)
                .userId(user.getId())
                .expiryDate(expiryDate)
                .isRevoked(false)
                .ipAddress(ipAddress)
                .deviceInfo(deviceInfo)
                .build();

        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        log.info("Refresh token created successfully for user_id={}", user.getId());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RefreshToken> verifyRefreshToken(String token) {
        if (!jwtGenerator.validateToken(token)) {
            log.warn("Refresh token verification failed - invalid JWT format");
            return Optional.empty();
        }

        Optional<RefreshToken> opt = refreshTokenRepository.findByTokenAndIsValidTrue(token);
        if (opt.isEmpty()) {
            log.warn("Refresh token verification failed - token not found in database or expired/revoked");
            return Optional.empty();
        }

        RefreshToken refreshToken = opt.get();
        if (!refreshToken.isValid()) {
            log.warn("Refresh token verification failed - invalid state: expired={}, revoked={}",
                    refreshToken.isExpired(), refreshToken.getIsRevoked());
            return Optional.empty();
        }

        log.info("Refresh token verified successfully");
        return Optional.of(refreshToken);
    }

    @Override
    @Transactional
    public void revokeRefreshToken(String token, String reason) {
        log.info("Revoking refresh token: reason={}", reason);
        refreshTokenRepository.findByToken(token).ifPresent(r -> {
            r.revoke(reason);
            refreshTokenRepository.save(r);
            log.info("Refresh token revoked successfully");
        });
    }

    @Override
    @Transactional
    public void revokeAllUserTokens(Long userId, String reason) {
        log.info("Revoking all refresh tokens for user: {}", userId);
        int count = refreshTokenRepository.revokeAllByUserId(userId, LocalDateTime.now(), reason);
        log.info("Revoked {} refresh tokens", count);
    }
}
