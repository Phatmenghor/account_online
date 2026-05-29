package com.internal.feature.auth.models;

import com.internal.config.entity.BaseEntity;
import com.internal.enumation.StatusData;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "acc_online_users")
@Data
@NoArgsConstructor
public class UserEntity extends BaseEntity {

    /** username stores the email address and is used as login identifier */
    @Column(nullable = false, unique = true)
    private String username;

    private String password;

    private String fullName;

    private String staffId;

    private String phoneNumber;

    private String position;

    private String profileUrl;

    @Enumerated(EnumType.STRING)
    private StatusData status;

    private boolean emailVerified = false;

    private String verificationCode;

    private LocalDateTime verificationCodeExpiry;

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.MERGE})
    @JoinTable(name = "acc_online_user_roles",
            joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "role_id", referencedColumnName = "id"))
    private List<Role> roles = new ArrayList<>();

    private LocalDateTime lastLogin;
}
