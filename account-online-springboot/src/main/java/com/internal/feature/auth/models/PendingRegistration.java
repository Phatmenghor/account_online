package com.internal.feature.auth.models;

import com.internal.config.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "acc_online_pending_registrations")
@Data
@NoArgsConstructor
public class PendingRegistration extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String username; // email

    private String password; // encoded

    private String fullName;

    private String position;

    private String staffId;

    private String phoneNumber;

    private String branch;

    private String verificationCode;

    private LocalDateTime verificationCodeExpiry;
}
