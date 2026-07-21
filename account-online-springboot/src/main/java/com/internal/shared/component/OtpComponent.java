package com.internal.shared.component;

import com.internal.config.CpbProperties;
import com.internal.shared.constant.AppConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OtpComponent {

    private static final String DIGITS = "0123456789";
    private final RandomGeneratorComponent randomGeneratorComponent;
    private final CpbProperties cpbProperties;

    /**
     * Generates a validation OTP based on the active environment and properties.
     */
    public String generate() {
        String environment = cpbProperties.getEnvironment();
        if ("development".equalsIgnoreCase(environment) || "uat".equalsIgnoreCase(environment)) {
            return AppConstants.DEFAULT_DEV_OTP;
        }
        int otpLength = cpbProperties.getOtp().getLength() > 0
                ? cpbProperties.getOtp().getLength()
                : AppConstants.DEFAULT_OTP_LENGTH;
        StringBuilder otp = new StringBuilder(otpLength);
        for (int i = 0; i < otpLength; i++) {
            otp.append(DIGITS.charAt(randomGeneratorComponent.nextInt(DIGITS.length())));
        }
        return otp.toString();
    }
}

