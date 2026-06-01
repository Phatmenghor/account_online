package com.internal.feature.email_otp.repository;

import com.internal.feature.email_otp.models.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {

    @Query(value = "SELECT * FROM acc_online_email_otp o " +
            "WHERE o.email = :email AND o.status = 0 " +
            "ORDER BY o.created_at DESC LIMIT 1", nativeQuery = true)
    Optional<EmailOtp> findLatestActiveOtpByEmail(@Param("email") String email);

    @Modifying
    @Transactional
    @Query("UPDATE EmailOtp o SET o.status = 2 WHERE o.email = :email AND o.status = 0")
    void expireAllActiveOtpsByEmail(@Param("email") String email);
}
