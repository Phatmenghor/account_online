package com.internal.shared.component;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
public class EmailComponent {

    /**
     * Stub method - Email sending is disabled in system.
     */
    public void sendHtmlEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        log.info("Email service disabled. Request to send email to '{}' ignored.", to);
    }
}
