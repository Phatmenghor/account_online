package com.internal.feature.sms_otp.service;

import com.internal.feature.sms_otp.dto.response.PhoneCheckResponse;

public interface PhoneCheckService {
    PhoneCheckResponse checkPhone(String phone);
}
