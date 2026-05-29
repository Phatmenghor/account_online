package com.internal.feature.auth.service.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import javax.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${email.sender.address}")
    private String senderAddress;

    @Async
    public void sendVerificationEmail(String toEmail, String fullName, String verificationCode) {
        try {
            Context context = new Context();
            context.setVariable("fullName", fullName != null ? fullName : toEmail);
            context.setVariable("verificationCode", verificationCode);
            context.setVariable("email", toEmail);

            String htmlContent = templateEngine.process("email-verification", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderAddress);
            helper.setTo(toEmail);
            helper.setSubject("Account Online – Email Verification Code");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Verification email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage());
        }
    }
}
