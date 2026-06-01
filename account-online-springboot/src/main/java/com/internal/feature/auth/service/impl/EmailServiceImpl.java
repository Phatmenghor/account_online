package com.internal.feature.auth.service.impl;

import com.internal.feature.auth.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import javax.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${email.sender.address}")
    private String senderAddress;

    @Value("${email.sender.enabled:true}")
    private boolean emailEnabled;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        if (!emailEnabled) {
            log.info("Email sending is disabled (email.sender.enabled=false). Skipping email to: {}", toEmail);
            return;
        }

        try {
            Context ctx = new Context();
            ctx.setVariable("otpCode", otpCode);
            String htmlBody = templateEngine.process("email-otp", ctx);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderAddress);
            helper.setTo(toEmail);
            helper.setSubject("CP Bank — Your Verification Code");
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("OTP email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again.", e);
        }
    }
}
