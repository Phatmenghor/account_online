package com.internal.feature.auth.repository;

import com.internal.feature.auth.models.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    @Query("SELECT r FROM RefreshToken r WHERE r.token = :token AND r.isRevoked = false AND r.expiryDate > CURRENT_TIMESTAMP")
    Optional<RefreshToken> findByTokenAndIsValidTrue(@Param("token") String token);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.isRevoked = true, r.revokedAt = :revokedAt, r.revocationReason = :reason WHERE r.userId = :userId AND r.isRevoked = false")
    int revokeAllByUserId(@Param("userId") Long userId, @Param("revokedAt") LocalDateTime revokedAt, @Param("reason") String reason);
}
