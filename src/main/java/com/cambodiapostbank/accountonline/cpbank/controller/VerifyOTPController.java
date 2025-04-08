package com.cambodiapostbank.accountonline.cpbank.controller;

<<<<<<< HEAD
import com.cambodiapostbank.accountonline.cpbank.domain.customer.dto.CustomerResponseDto;
=======
>>>>>>> customer_register_v1
import com.cambodiapostbank.accountonline.cpbank.domain.otp.dto.SendOtpRequestDto;
import com.cambodiapostbank.accountonline.cpbank.domain.otp.dto.VerifyOTPRequestDto;
import com.cambodiapostbank.accountonline.cpbank.domain.otp.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
<<<<<<< HEAD
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.io.EOFException;
=======
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
>>>>>>> customer_register_v1
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
<<<<<<< HEAD
    public  ResponseEntity<Map<String, String>> sendOtp(@Valid @RequestBody SendOtpRequestDto sendOtpRequestDto) throws IOException {
        log.info("Send OTP: " + sendOtpRequestDto.toJSON());
        Map<String, String> response = new LinkedHashMap<>();
        if(service.sendOtp(sendOtpRequestDto)){
            response.put("status", "OK");
            response.put("message", "Send OTP in successfully");
            log.info("Send OTP Successfully: " + sendOtpRequestDto.toJSON());
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        log.info("Send OTP failed: " + sendOtpRequestDto.toJSON());
        response.put("status", "Failed");
        response.put("message", "Send OTP failed.");
=======
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
>>>>>>> customer_register_v1
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verify(@Valid @RequestBody VerifyOTPRequestDto requestDto) throws IOException {
<<<<<<< HEAD
        log.info("Start Verify OTP: "+requestDto.toJSON());
        Map<String, String> response = new LinkedHashMap<>();
        if(service.verifyOtp(requestDto)){
            response.put("status", "OK");
            response.put("message", "Verified OTP in successfully");
            log.info("Verify OTP Successfully: "+requestDto.toJSON());
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        log.info("Verify OTP failed: "+requestDto.toJSON());
        response.put("status", "Failed");
        response.put("message", "OTP is invalid.");
=======
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
>>>>>>> customer_register_v1
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}
