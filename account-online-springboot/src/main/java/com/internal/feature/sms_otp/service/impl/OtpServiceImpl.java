package com.internal.feature.sms_otp.service.impl;

import com.internal.config.CpbProperties;
import com.internal.shared.exception.otp.OtpAttemptsExceededException;
import com.internal.shared.exception.otp.OtpCooldownException;
import com.internal.shared.exception.otp.OtpInvalidException;
import com.internal.shared.exception.otp.OtpNotFoundException;
import com.internal.feature.sms_otp.dto.request.SendOtpRequest;
import com.internal.feature.sms_otp.dto.request.VerifyOtpRequest;
import com.internal.feature.sms_otp.dto.response.SendOtpResponse;
import com.internal.feature.sms_otp.dto.response.VerifyOtpResponse;
import com.internal.feature.sms_otp.mapper.SmsOtpMapper;
import com.internal.feature.sms_otp.models.OtpSms;
import com.internal.feature.sms_otp.repository.OtpRepository;
import com.internal.feature.sms_otp.service.OtpService;
import com.internal.shared.component.OtpComponent;
import com.internal.integration.ports.SmsPort;
import com.internal.shared.constant.AppConstants;
import com.internal.feature.sms_otp.dto.response.PhoneCheckResponse;
import com.internal.feature.sms_otp.service.PhoneCheckService;
import com.internal.shared.exception.custom.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OtpServiceImpl implements OtpService {

    private final OtpRepository otpRepository;
    private final OtpComponent otpComponent;
    private final SmsOtpMapper otpMapper;
    private final CpbProperties cpbProperties;
    private final SmsPort smsPort;
    private final PhoneCheckService phoneCheckService;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public SendOtpResponse sendOtp(SendOtpRequest request) {
        String phone = request.getPhone();
        log.info("Processing OTP request for phone: {}", phone);

        // Pre-check if phone number is already registered in MB Core before sending OTP
        PhoneCheckResponse phoneCheck = phoneCheckService.checkPhone(phone);
        if (phoneCheck != null && Boolean.TRUE.equals(phoneCheck.getHasAccount())) {
            log.warn("Send OTP rejected: Phone number {} is already registered with CIF {}", phone, phoneCheck.getCif());
            throw new BadRequestException("Phone number is already registered with an active Mobile Banking account.");
        }

        checkCooldownPeriod(phone);
        checkAttemptLockout(phone);

        otpRepository.expireAllActiveOtpsByPhone(phone);

        String otpCode = otpComponent.generate();
        LocalDateTime expiresAt = LocalDateTime.now()
                .plusMinutes(cpbProperties.getOtp().getExpiryMinutes());

        OtpSms otpSms = OtpSms.builder()
                .phone(phone)
                .otpCode(otpCode)
                .attempt(0)
                .status(0)
                .expiresAt(expiresAt)
                .build();

        otpSms = otpRepository.save(otpSms);
        log.info("OTP created successfully - ID: {}, Phone: {}", otpSms.getId(), phone);

        if (AppConstants.DEFAULT_DEV_OTP.equals(otpCode)) {
            log.info("Skipping SMS sending for default OTP: {}", otpCode);
        } else {
            try {
                String message = cpbProperties.getOtp().getMessage() + " " + otpCode;
                smsPort.sendSms(phone, message);
            } catch (Exception e) {
                log.error("SMS sending failed but OTP was saved - Phone: {}, OTP ID: {}", phone, otpSms.getId(), e);
            }
        }

        return otpMapper.toSendOtpResponse(otpSms);
    }

    @Override
    @Transactional(noRollbackFor = {OtpInvalidException.class, OtpAttemptsExceededException.class})
    public VerifyOtpResponse verifyOtp(VerifyOtpRequest request) {
        String phone = request.getPhone();
        String otpCode = request.getOtpCode();
        log.info("Processing OTP verification for phone: {}", phone);

        OtpSms latestOtp = otpRepository.findLatestActiveOtpByPhone(phone)
                .orElseThrow(() -> new OtpNotFoundException(phone));

        boolean isValid = latestOtp.getOtpCode().equals(otpCode)
                && latestOtp.getExpiresAt().isAfter(LocalDateTime.now());

        if (!isValid) {
            int remainingAttempts = AppConstants.MAX_ATTEMPTS - latestOtp.getAttempt();

            if (remainingAttempts <= 0) {
                long secondsSinceLastAttempt = Duration.between(
                        latestOtp.getLastAttempt(), LocalDateTime.now()
                ).getSeconds();
                long lockoutSeconds = AppConstants.LOCKOUT_MINUTES * 60;
                long remainingSeconds = Math.max(0, lockoutSeconds - secondsSinceLastAttempt);
                throw new OtpAttemptsExceededException(remainingSeconds);
            }

            incrementFailedAttempt(latestOtp);
            remainingAttempts = AppConstants.MAX_ATTEMPTS - latestOtp.getAttempt();

            if (remainingAttempts <= 0) {
                long lockoutSeconds = AppConstants.LOCKOUT_MINUTES * 60;
                throw new OtpAttemptsExceededException(lockoutSeconds);
            }

            throw new OtpInvalidException(remainingAttempts);
        }

        latestOtp.setStatus(1);
        latestOtp.setVerifiedAt(LocalDateTime.now());
        otpRepository.save(latestOtp);

        log.info("OTP verified successfully - ID: {}, Phone: {}", latestOtp.getId(), phone);

        return otpMapper.toVerifyOtpResponse(latestOtp);
    }

    private void checkAttemptLockout(String phone) {
        Optional<OtpSms> latestOtp = otpRepository.findLatestActiveOtpByPhone(phone);
        if (latestOtp.isEmpty()) return;

        OtpSms otp = latestOtp.get();

        if (otp.getAttempt() >= AppConstants.MAX_ATTEMPTS && otp.getLastAttempt() != null) {
            long secondsSinceLastAttempt = Duration.between(
                    otp.getLastAttempt(), LocalDateTime.now()
            ).getSeconds();

            long lockoutSeconds = AppConstants.LOCKOUT_MINUTES * 60;

            if (secondsSinceLastAttempt < lockoutSeconds) {
                long remainingSeconds = lockoutSeconds - secondsSinceLastAttempt;
                throw new OtpAttemptsExceededException(remainingSeconds);
            }
        }
    }

    private void checkCooldownPeriod(String phone) {
        Optional<LocalDateTime> lastOtpTime = otpRepository.findLastOtpCreationTime(phone);
        if (lastOtpTime.isEmpty()) return;

        long elapsedSeconds = Duration.between(lastOtpTime.get(), LocalDateTime.now()).getSeconds();
        long cooldownSeconds = cpbProperties.getOtp().getCooldownSeconds();

        if (elapsedSeconds < cooldownSeconds) {
            int remainingSeconds = (int) (cooldownSeconds - elapsedSeconds);
            throw new OtpCooldownException(remainingSeconds);
        }
    }

    private void incrementFailedAttempt(OtpSms otp) {
        otp.setAttempt(otp.getAttempt() + 1);
        otp.setLastAttempt(LocalDateTime.now());
        otpRepository.saveAndFlush(otp);
        entityManager.clear();
    }
}
