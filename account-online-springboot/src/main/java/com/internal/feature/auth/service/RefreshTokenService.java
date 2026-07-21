package com.internal.feature.auth.service;

import com.internal.feature.auth.models.RefreshToken;
import com.internal.feature.auth.models.UserEntity;

import java.util.Optional;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(UserEntity user, String ipAddress, String deviceInfo);
    Optional<RefreshToken> verifyRefreshToken(String token);
    void revokeRefreshToken(String token, String reason);
    void revokeAllUserTokens(Long userId, String reason);
}
