package com.internal.feature.auth.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otpCode);
}
