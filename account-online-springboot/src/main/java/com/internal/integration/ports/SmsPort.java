package com.internal.integration.ports;

public interface SmsPort {
    void sendSms(String url, String secretKey, String phone, String message);
    void sendSms(String phone, String message);
}
