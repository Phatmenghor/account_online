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
    public ResponseEntity<Map<String, String>> sendOtp(@Valid @RequestBody SendOtpRequestDto sendOtpRequestDto) throws IOException {
        log.info("[OTP Send] Incoming request to send OTP for phone number: " + sendOtpRequestDto.getPhoneNumber());
        Map<String, String> response = new LinkedHashMap<>();
        if (service.sendOtp(sendOtpRequestDto)) {
            response.put("status", "OK");
            response.put("message", "OTP sent successfully.");
            log.info("[OTP Send] OTP sent successfully to phone number: " + sendOtpRequestDto.getPhoneNumber());
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        log.warn("[OTP Send] Failed to send OTP to phone number: " + sendOtpRequestDto.getPhoneNumber());
        response.put("status", "Failed");
        response.put("message", "Failed to send OTP.");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verify(@Valid @RequestBody VerifyOTPRequestDto requestDto) throws IOException {
        log.info("[OTP Verification] Start verifying OTP for phone number: " + requestDto.getPhoneNumber());
        Map<String, String> response = new LinkedHashMap<>();
        if (service.verifyOtp(requestDto)) {
            response.put("status", "OK");
            response.put("message", "OTP verified successfully.");
            log.info("[OTP Verification] OTP successfully verified for phone number: " + requestDto.getPhoneNumber());
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        log.warn("[OTP Verification] OTP verification failed for phone number: " + requestDto.getPhoneNumber());
        response.put("status", "Failed");
        response.put("message", "Invalid OTP provided.");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}
