package com.internal.feature.sms_otp.controller;

import com.internal.feature.sms_otp.dto.request.SendOtpRequest;
import com.internal.feature.sms_otp.dto.request.VerifyOtpRequest;
import com.internal.feature.sms_otp.dto.response.SendOtpResponse;
import com.internal.feature.sms_otp.dto.response.VerifyOtpResponse;
import com.internal.feature.sms_otp.service.JuniorOtpSmsService;
import com.internal.shared.constant.ResponseMessage;
import com.internal.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/junior-otp")
@RequiredArgsConstructor
@Slf4j
public class JuniorOtpSmsController {

    private final JuniorOtpSmsService juniorOtpSmsService;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<SendOtpResponse>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        log.info("Junior OTP send request for phone: {}", request.getPhone());
        SendOtpResponse response = juniorOtpSmsService.sendOtp(request);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.OTP_SENT, response));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        log.info("Junior OTP verify request for phone: {}", request.getPhone());
        VerifyOtpResponse response = juniorOtpSmsService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.OTP_VERIFIED, response));
    }
}
