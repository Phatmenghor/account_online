package com.internal.feature.sms_otp.service.impl;

import com.internal.feature.sms_otp.dto.response.PhoneCheckResponse;
import com.internal.feature.sms_otp.repository.PhoneCheckRepository;
import com.internal.feature.sms_otp.service.PhoneCheckService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhoneCheckServiceImpl implements PhoneCheckService {

    private final PhoneCheckRepository phoneCheckRepository;

    @Override
    public PhoneCheckResponse checkPhone(String phone) {
        log.info("Checking phone number against MB Core: {}", maskPhone(phone));

        Map<String, String> result = phoneCheckRepository.findActiveMbCustomerByPhone(phone);

        if (result == null) {
            // Phone not found → safe to proceed with account opening
            log.info("Phone check result: NOT registered - {}", maskPhone(phone));
            return PhoneCheckResponse.builder()
                    .hasAccount(false)
                    .build();
        }

        // Phone found → already has an active MB account
        log.info("Phone check result: ALREADY REGISTERED - CIF: {}, Phone: {}",
                result.get("cif"), maskPhone(phone));

        return PhoneCheckResponse.builder()
                .hasAccount(true)
                .cif(result.get("cif"))
                .mobile(result.get("mobile"))
                .build();
    }

    /** Mask phone for safe logging (show only last 4 digits) */
    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "***";
        return "***" + phone.substring(phone.length() - 4);
    }
}
