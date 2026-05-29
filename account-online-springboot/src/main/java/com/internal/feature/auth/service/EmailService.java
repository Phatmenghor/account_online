package com.internal.feature.auth.service;

public interface EmailService {
    void sendVerificationEmail(String toEmail, String verificationCode);
}
