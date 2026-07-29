package com.internal.feature.sms_otp.models;

import com.internal.config.entity.BaseEntity;
import lombok.*;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "junior_otp_sms")
public class JuniorOtpSms extends BaseEntity {

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "otp_code", nullable = false, length = 6)
    private String otpCode;

    @Column(name = "attempt", nullable = false)
    @Builder.Default
    private Integer attempt = 0;

    @Column(name = "last_attempt")
    private LocalDateTime lastAttempt;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private Integer status = 0; // 0 = active, 1 = verified, 2 = expired

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @PrePersist
    @Override
    protected void onCreate() {
        super.onCreate();
        if (expiresAt == null) {
            expiresAt = LocalDateTime.now().plusMinutes(5);
        }
    }
}
