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

    @Column(nullable = false, unique = true)
    private String username;

    private String email;

    private String password;

    private String fullName;

    private String position;

    private String profileUrl;

    private String phoneNumber;

    private String department;

    private String branch;

    @Enumerated(EnumType.STRING)
    private StatusData status;

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.MERGE})
    @JoinTable(name = "acc_online_user_roles",
            joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "role_id", referencedColumnName = "id"))
    private List<Role> roles = new ArrayList<>();

    private LocalDateTime lastLogin;

    @Column(name = "force_password_change", nullable = false, columnDefinition = "boolean default false")
    private boolean forcePasswordChange = false;

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;
}


