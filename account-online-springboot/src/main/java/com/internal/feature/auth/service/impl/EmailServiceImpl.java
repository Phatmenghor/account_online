package com.internal.feature.auth.service.impl;

import com.internal.feature.auth.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${email.sender.address}")
    private String senderAddress;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderAddress);
            message.setTo(toEmail);
            message.setSubject("CP Bank - Email Verification Code");
            message.setText(
                "Dear User,\n\n" +
                "Your verification code for CP Bank Account Online registration is:\n\n" +
                "        " + otpCode + "\n\n" +
                "This code will expire in 5 minutes.\n" +
                "Do not share this code with anyone.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Regards,\n" +
                "CP Bank IT Department\n" +
                "Tel: 070 200 002 | 1800 200 888 (Free)"
            );
            mailSender.send(message);
            log.info("OTP email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            throw e;
        }
    }
}
