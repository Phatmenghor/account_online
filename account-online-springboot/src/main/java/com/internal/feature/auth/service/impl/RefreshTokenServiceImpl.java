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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenServiceImpl implements RefreshTokenService {

    @Override
    public RefreshToken createRefreshToken(UserEntity user, String ipAddress, String deviceInfo) {
        return null;
    }

    @Override
    public Optional<RefreshToken> verifyRefreshToken(String token) {
        return Optional.empty();
    }

    @Override
    public void revokeRefreshToken(String token, String reason) {
    }

    @Override
    public void revokeAllUserTokens(Long userId, String reason) {
    }
}
