package com.cambodiapostbank.accountonline.cpbank.controller;

import com.cambodiapostbank.accountonline.cpbank.domain.customer.dto.CustomerResponseDto;
import com.cambodiapostbank.accountonline.cpbank.domain.otp.dto.SendOtpRequestDto;
import com.cambodiapostbank.accountonline.cpbank.domain.otp.dto.VerifyOTPRequestDto;
import com.cambodiapostbank.accountonline.cpbank.domain.otp.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.io.EOFException;
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
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verify(@Valid @RequestBody VerifyOTPRequestDto requestDto) throws IOException {
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
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}
