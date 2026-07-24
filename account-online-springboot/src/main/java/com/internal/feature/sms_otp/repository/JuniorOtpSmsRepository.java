package com.internal.feature.sms_otp.repository;

import com.internal.feature.sms_otp.models.JuniorOtpSms;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JuniorOtpSmsRepository extends JpaRepository<JuniorOtpSms, Long> {

    Optional<JuniorOtpSms> findTopByPhoneAndStatusOrderByCreatedAtDesc(String phone, Integer status);

    Optional<JuniorOtpSms> findTopByPhoneOrderByCreatedAtDesc(String phone);
}
