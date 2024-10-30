package com.cambodiapostbank.accountonline.cpbank.domain.otp.service;

import com.cambodiapostbank.accountonline.cpbank.domain.otp.dto.SendOtpRequestDto;
import com.cambodiapostbank.accountonline.cpbank.domain.otp.dto.VerifyOTPRequestDto;
import com.cambodiapostbank.accountonline.cpbank.utils.http.CpbHttpClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.HttpURLConnection;

@Service
public class OtpServiceImpl implements OtpService {

    private final CpbHttpClient httpClient;

    @Autowired
    public OtpServiceImpl(CpbHttpClient httpClient) {
        this.httpClient = httpClient;
    }

    @Override
    public boolean sendOtp(SendOtpRequestDto sendOtpRequestDto) throws IOException {
        HttpURLConnection response = httpClient.post("api/sms", sendOtpRequestDto.toJSON());
        return response.getResponseCode() == HttpURLConnection.HTTP_OK;
    }

    @Override
    public boolean verifyOtp(VerifyOTPRequestDto requestDto) throws IOException {
        HttpURLConnection response = httpClient.post("api/verifyOtp", requestDto.toJSON());
        return response.getResponseCode() == HttpURLConnection.HTTP_OK;
    }

    @Override
    public boolean isVerifiedOtp(VerifyOTPRequestDto requestDto) throws IOException {
        HttpURLConnection response = httpClient.post("api/IsVerifiedOtp", requestDto.toJSON());
        System.out.println("==========");
        System.out.println(response);
        System.out.println("==========");
        return response.getResponseCode() == HttpURLConnection.HTTP_OK;
    }
}
