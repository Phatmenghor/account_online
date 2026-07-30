package com.internal.feature.sms_otp.service.impl;

import com.internal.config.CpbProperties;
import com.internal.feature.sms_otp.dto.request.SendOtpRequest;
import com.internal.feature.sms_otp.dto.request.VerifyOtpRequest;
import com.internal.feature.sms_otp.dto.response.SendOtpResponse;
import com.internal.feature.sms_otp.dto.response.VerifyOtpResponse;
import com.internal.feature.sms_otp.models.JuniorOtpSms;
import com.internal.feature.sms_otp.models.JuniorSmsLog;
import com.internal.feature.sms_otp.repository.JuniorOtpSmsRepository;
import com.internal.feature.sms_otp.repository.JuniorSmsLogRepository;
import com.internal.feature.sms_otp.service.JuniorOtpSmsService;
import com.internal.integration.ports.SmsPort;
import com.internal.shared.component.OtpComponent;
import com.internal.shared.exception.otp.OtpAttemptsExceededException;
import com.internal.shared.exception.otp.OtpCooldownException;
import com.internal.shared.exception.otp.OtpInvalidException;
import com.internal.shared.exception.otp.OtpNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

import com.internal.feature.sms_otp.dto.response.PhoneCheckResponse;
import com.internal.feature.sms_otp.service.PhoneCheckService;
import com.internal.shared.exception.custom.BadRequestException;

import com.internal.feature.junior_account.dto.response.CustomerInfoResponse;
import com.internal.feature.junior_account.service.CustomerInfoService;

import com.internal.feature.junior_account.repository.JuniorAccountFinalRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class JuniorOtpSmsServiceImpl implements JuniorOtpSmsService {

    private final JuniorOtpSmsRepository juniorOtpSmsRepository;
    private final JuniorSmsLogRepository juniorSmsLogRepository;
    private final JuniorAccountFinalRepository juniorAccountFinalRepository;
    private final OtpComponent otpComponent;
    private final CpbProperties cpbProperties;
    private final SmsPort smsPort;
    private final PhoneCheckService phoneCheckService;
    private final CustomerInfoService customerInfoService;

    @Override
    @Transactional
    public SendOtpResponse sendOtp(SendOtpRequest request) {
        String phone = request.getPhone() != null ? request.getPhone().trim() : "";
        String roleType = request.getType() != null ? request.getType().trim().toUpperCase() : "GUARDIAN";
        log.info("Processing Junior OTP send request for phone: {} | Role: {}", maskPhone(phone), roleType);

        if ("JUNIOR".equals(roleType) || "OWNER".equals(roleType) || "CHILD".equals(roleType)) {
            // Junior / Owner Phone Validation: Must NOT be registered anywhere
            if (juniorAccountFinalRepository.existsByPhoneNumber(phone)) {
                log.warn("Junior OTP send REJECTED: Phone number {} is ALREADY registered in Junior Account database", maskPhone(phone));
                throw new BadRequestException("Junior phone number is already registered with an existing Junior account.");
            }
            PhoneCheckResponse phoneCheck = phoneCheckService.checkPhone(phone);
            if (phoneCheck != null && Boolean.TRUE.equals(phoneCheck.getHasAccount())) {
                log.warn("Junior OTP send REJECTED: Phone number {} is ALREADY registered in MB Core (CIF: {})", maskPhone(phone), phoneCheck.getCif());
                throw new BadRequestException("Junior phone number is already registered with an active Mobile Banking account.");
            }
        } else {
            // Guardian / Parent Phone Validation: MUST be registered in MB Core
            PhoneCheckResponse phoneCheck = phoneCheckService.checkPhone(phone);
            if (phoneCheck == null || !Boolean.TRUE.equals(phoneCheck.getHasAccount())) {
                log.warn("Guardian OTP send REJECTED: Phone number {} is NOT registered in MB Core", maskPhone(phone));
                throw new BadRequestException("Guardian phone number must be registered with an active Mobile Banking account.");
            }
        }

        checkCooldownPeriod(phone);
        checkAttemptLockout(phone);

        juniorOtpSmsRepository.findTopByPhoneAndStatusOrderByCreatedAtDesc(phone, 0)
                .ifPresent(otp -> {
                    otp.setStatus(2);
                    juniorOtpSmsRepository.save(otp);
                });

        String otpCode = otpComponent.generate();
        LocalDateTime expiresAt = LocalDateTime.now()
                .plusMinutes(cpbProperties.getOtp().getExpiryMinutes());

        JuniorOtpSms juniorOtpSms = JuniorOtpSms.builder()
                .phone(phone)
                .otpCode(otpCode)
                .attempt(0)
                .status(0)
                .expiresAt(expiresAt)
                .build();

        juniorOtpSmsRepository.save(juniorOtpSms);
        log.info("Saved Junior OTP for phone: {}, code: {}", phone, otpCode);

        try {
            smsPort.sendSms(phone, otpCode);
            juniorSmsLogRepository.save(JuniorSmsLog.builder()
                    .phone(phone)
                    .message("Junior OTP: " + otpCode)
                    .status("SUCCESS")
                    .build());
        } catch (Exception e) {
            log.error("Failed to send Junior SMS to {}: {}", phone, e.getMessage());
            juniorSmsLogRepository.save(JuniorSmsLog.builder()
                    .phone(phone)
                    .message("Junior OTP: " + otpCode)
                    .status("FAILED")
                    .errorMessage(e.getMessage())
                    .build());
        }

        return SendOtpResponse.builder()
                .phone(phone)
                .message("Junior OTP sent successfully")
                .expiresAt(expiresAt)
                .build();
    }

    @Override
    @Transactional
    public VerifyOtpResponse verifyOtp(VerifyOtpRequest request) {
        String phone = request.getPhone();
        String inputOtp = request.getOtpCode();
        log.info("Verifying Junior OTP for phone: {}", phone);

        JuniorOtpSms juniorOtpSms = juniorOtpSmsRepository
                .findTopByPhoneAndStatusOrderByCreatedAtDesc(phone, 0)
                .orElseThrow(() -> new OtpNotFoundException("No active Junior OTP found for phone: " + phone));

        if (LocalDateTime.now().isAfter(juniorOtpSms.getExpiresAt())) {
            juniorOtpSms.setStatus(2);
            juniorOtpSmsRepository.save(juniorOtpSms);
            throw new OtpNotFoundException("Junior OTP has expired");
        }

        if (juniorOtpSms.getAttempt() >= cpbProperties.getOtp().getMaxAttempts()) {
            throw new OtpAttemptsExceededException((long) (cpbProperties.getOtp().getLockMinutes() * 60));
        }

        if (!juniorOtpSms.getOtpCode().equals(inputOtp)) {
            juniorOtpSms.setAttempt(juniorOtpSms.getAttempt() + 1);
            juniorOtpSms.setLastAttempt(LocalDateTime.now());
            juniorOtpSmsRepository.save(juniorOtpSms);
            int remaining = cpbProperties.getOtp().getMaxAttempts() - juniorOtpSms.getAttempt();
            throw new OtpInvalidException(remaining);
        }

        juniorOtpSms.setStatus(1);
        juniorOtpSms.setVerifiedAt(LocalDateTime.now());
        juniorOtpSmsRepository.save(juniorOtpSms);

        log.info("Junior OTP successfully verified for phone: {}", phone);

        // Fetch Guardian details from MB Core & T24 to return on UI upon OTP verification success
        String cif = null;
        String customerName = null;
        try {
            PhoneCheckResponse phoneCheck = phoneCheckService.checkPhone(phone);
            if (phoneCheck != null && phoneCheck.getCif() != null) {
                cif = phoneCheck.getCif();
                if (phoneCheck.getCustomerName() != null && !phoneCheck.getCustomerName().isBlank()) {
                    customerName = phoneCheck.getCustomerName();
                }
                try {
                    CustomerInfoResponse info = customerInfoService.getCustomerByCif(cif);
                    if (info != null) {
                        if (info.getShortNames() != null && !info.getShortNames().isEmpty()) {
                            customerName = String.join(" ", info.getShortNames());
                        } else if (info.getNames() != null && !info.getNames().isEmpty()) {
                            customerName = String.join(" ", info.getNames());
                        } else if (info.getKhShortName() != null) {
                            customerName = info.getKhShortName();
                        }
                    }
                } catch (Exception e) {
                    log.warn("Could not fetch T24 customer details for Guardian CIF {}: {}", cif, e.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("Could not fetch MB Core phone check for Guardian phone {}: {}", phone, e.getMessage());
        }

        return VerifyOtpResponse.builder()
                .phone(phone)
                .verified(true)
                .message("Junior OTP verified successfully")
                .cif(cif)
                .customerName(customerName)
                .build();
    }

    private void checkCooldownPeriod(String phone) {
        Optional<JuniorOtpSms> latestOtpOpt = juniorOtpSmsRepository.findTopByPhoneOrderByCreatedAtDesc(phone);
        if (latestOtpOpt.isPresent()) {
            JuniorOtpSms latestOtp = latestOtpOpt.get();
            LocalDateTime createdAt = latestOtp.getCreatedAt();
            if (createdAt != null) {
                long secondsSinceCreation = Duration.between(createdAt, LocalDateTime.now()).getSeconds();
                int cooldownSeconds = cpbProperties.getOtp().getCooldownSeconds();
                if (secondsSinceCreation < cooldownSeconds) {
                    long remainingSeconds = cooldownSeconds - secondsSinceCreation;
                    throw new OtpCooldownException((int) remainingSeconds);
                }
            }
        }
    }

    private void checkAttemptLockout(String phone) {
        Optional<JuniorOtpSms> latestOtpOpt = juniorOtpSmsRepository.findTopByPhoneOrderByCreatedAtDesc(phone);
        if (latestOtpOpt.isPresent()) {
            JuniorOtpSms latestOtp = latestOtpOpt.get();
            if (latestOtp.getAttempt() >= cpbProperties.getOtp().getMaxAttempts() && latestOtp.getLastAttempt() != null) {
                long minutesSinceLastAttempt = Duration.between(latestOtp.getLastAttempt(), LocalDateTime.now()).toMinutes();
                int lockMinutes = cpbProperties.getOtp().getLockMinutes();
                if (minutesSinceLastAttempt < lockMinutes) {
                    long remainingSeconds = (lockMinutes - minutesSinceLastAttempt) * 60;
                    throw new OtpAttemptsExceededException(remainingSeconds);
                }
            }
        }
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "***";
        return "***" + phone.substring(phone.length() - 4);
    }
}
