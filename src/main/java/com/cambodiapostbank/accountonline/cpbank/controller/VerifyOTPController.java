package com.cambodiapostbank.accountonline.cpbank.controller;

import com.cambodiapostbank.accountonline.cpbank.domain.otp.dto.SendOtpRequestDto;
import com.cambodiapostbank.accountonline.cpbank.domain.otp.dto.VerifyOTPRequestDto;
import com.cambodiapostbank.accountonline.cpbank.domain.otp.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/otp")
public class VerifyOTPController {
    private final OtpService service;
    private final Log log = LogFactory.getLog(VerifyOTPController.class);

    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody SendOtpRequestDto sendOtpRequestDto) throws IOException {
        log.info("[OTP Send] Incoming request to send OTP for phone number: " + sendOtpRequestDto.getPhoneNumber());

        try {
            // Call the service which should return the actual C# API response
            Object csharpResponse = service.sendOtpRaw(sendOtpRequestDto);

            // Handle different types of responses from C# API
            if (csharpResponse instanceof Integer) {
                int responseCode = (Integer) csharpResponse;

                if (responseCode > 0) {
                    // Positive number = OTP sent successfully, return the OTP code
                    log.info("[OTP Send] OTP sent successfully to phone number: " + sendOtpRequestDto.getPhoneNumber());
                    return new ResponseEntity<>(responseCode, HttpStatus.OK);
                }
                else if (responseCode == -500) {
                    // -500 = Phone banned for 5 minutes
                    log.warn("[OTP Send] Phone number banned: " + sendOtpRequestDto.getPhoneNumber());
                    return new ResponseEntity<>(responseCode, HttpStatus.OK);
                }
                else if (responseCode < 0 && responseCode >= -60) {
                    // Negative number from -60 to -1 = wait time in seconds
                    log.info("[OTP Send] Wait time for phone number " + sendOtpRequestDto.getPhoneNumber() + ": " + Math.abs(responseCode) + " seconds");
                    return new ResponseEntity<>(responseCode, HttpStatus.OK);
                }
            }

            // Default success response if format is unexpected
            Map<String, String> response = new LinkedHashMap<>();
            response.put("status", "OK");
            response.put("message", "OTP sent successfully.");
            log.info("[OTP Send] OTP sent successfully to phone number: " + sendOtpRequestDto.getPhoneNumber());
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            log.error("[OTP Send] Error sending OTP to phone number: " + sendOtpRequestDto.getPhoneNumber(), e);

            // Check if it's a ban-related error
            if (e.getMessage() != null && e.getMessage().contains("TOO_MANY_ATTEMPTS")) {
                Map<String, String> response = new LinkedHashMap<>();
                response.put("status", "Failed");
                response.put("message", e.getMessage()); // This should contain "TOO_MANY_ATTEMPTS-299.2573603"
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            Map<String, String> response = new LinkedHashMap<>();
            response.put("status", "Failed");
            response.put("message", "Failed to send OTP.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verify(@Valid @RequestBody VerifyOTPRequestDto requestDto) throws IOException {
        log.info("[OTP Verification] Start verifying OTP for phone number: " + requestDto.getPhoneNumber());
        Map<String, String> response = new LinkedHashMap<>();

        try {
            // Call the service which should handle the C# API call
            boolean isVerified = service.verifyOtp(requestDto);

            if (isVerified) {
                response.put("status", "OK");
                response.put("message", "OTP_VERIFIED");
                log.info("[OTP Verification] OTP successfully verified for phone number: " + requestDto.getPhoneNumber());
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                // This should not happen as exceptions should be thrown for failures
                response.put("status", "Failed");
                response.put("message", "OTP_INVALID");
                log.warn("[OTP Verification] OTP verification failed for phone number: " + requestDto.getPhoneNumber());
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

        } catch (Exception e) {
            log.error("[OTP Verification] Error verifying OTP for phone number: " + requestDto.getPhoneNumber(), e);

            response.put("status", "Failed");

            // Handle specific C# API error messages
            String errorMessage = e.getMessage();
            if (errorMessage != null) {
                if (errorMessage.contains("OTP_EXPIRED")) {
                    response.put("message", "OTP_EXPIRED");
                } else if (errorMessage.contains("OTP_INVALID")) {
                    response.put("message", "OTP_INVALID");
                } else if (errorMessage.contains("TOO_MANY_ATTEMPTS")) {
                    response.put("message", errorMessage); // This should contain "TOO_MANY_ATTEMPTS-299.2573603"
                } else {
                    response.put("message", "OTP_INVALID"); // Default fallback
                }
            } else {
                response.put("message", "OTP_INVALID");
            }

            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }
}