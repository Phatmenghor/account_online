package com.internal.feature.sms_otp.controller;

import com.internal.shared.response.ApiResponse;
import com.internal.feature.sms_otp.dto.request.PhoneCheckRequest;
import com.internal.feature.sms_otp.dto.request.SendOtpRequest;
import com.internal.feature.sms_otp.dto.request.VerifyOtpRequest;
import com.internal.feature.sms_otp.dto.response.PhoneCheckResponse;
import com.internal.feature.sms_otp.dto.response.SendOtpResponse;
import com.internal.feature.sms_otp.dto.response.VerifyOtpResponse;
import com.internal.feature.sms_otp.service.OtpService;
import com.internal.feature.sms_otp.service.PhoneCheckService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/public/otp")
@RequiredArgsConstructor
@Slf4j
@Validated
public class OtpController {

    private final OtpService otpService;
    private final PhoneCheckService phoneCheckService;

    /**
     * Check if a phone number is already registered in MB Core.
     */
    @PostMapping("/check-phone")
    public ResponseEntity<ApiResponse<PhoneCheckResponse>> checkPhone(
            @Valid @RequestBody PhoneCheckRequest request) {

        log.info("[OtpController] Phone pre-check request. phone={}", request.getPhone());
        PhoneCheckResponse response = phoneCheckService.checkPhone(request.getPhone());

        String message = response.getHasAccount()
                ? "Phone number is already registered."
                : "Phone number is not registered.";

        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<SendOtpResponse>> sendOtp(
            @Valid @RequestBody SendOtpRequest request) {

        log.info("[OtpController] Send OTP request. phone={}", request.getPhone());
        SendOtpResponse response = otpService.sendOtp(request);

        return ResponseEntity.ok(
                ApiResponse.success("OTP sent successfully!", response)
        );
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        log.info("[OtpController] Verify OTP request. phone={}", request.getPhone());
        VerifyOtpResponse response = otpService.verifyOtp(request);

        return ResponseEntity.ok(
                ApiResponse.success("OTP verified successfully!", response)
        );
    }
}
