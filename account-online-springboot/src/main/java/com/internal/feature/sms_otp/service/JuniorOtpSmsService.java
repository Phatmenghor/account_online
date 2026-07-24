package com.internal.feature.sms_otp.service;

import com.internal.feature.sms_otp.dto.request.SendOtpRequest;
import com.internal.feature.sms_otp.dto.request.VerifyOtpRequest;
import com.internal.feature.sms_otp.dto.response.SendOtpResponse;
import com.internal.feature.sms_otp.dto.response.VerifyOtpResponse;

public interface JuniorOtpSmsService {

    SendOtpResponse sendOtp(SendOtpRequest request);

    VerifyOtpResponse verifyOtp(VerifyOtpRequest request);
}
