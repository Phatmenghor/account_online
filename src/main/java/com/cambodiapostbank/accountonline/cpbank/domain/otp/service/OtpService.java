package com.cambodiapostbank.accountonline.cpbank.domain.otp.service;

import com.cambodiapostbank.accountonline.cpbank.domain.otp.dto.SendOtpRequestDto;
import com.cambodiapostbank.accountonline.cpbank.domain.otp.dto.VerifyOTPRequestDto;

import java.io.IOException;

public interface OtpService {
    boolean sendOtp(SendOtpRequestDto sendOtpRequestDto) throws IOException;

    boolean verifyOtp(VerifyOTPRequestDto requestDto) throws IOException;

    boolean isVerifiedOtp(VerifyOTPRequestDto requestDto) throws IOException;
}
