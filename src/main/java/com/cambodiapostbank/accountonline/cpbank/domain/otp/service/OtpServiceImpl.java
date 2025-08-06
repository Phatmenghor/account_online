package com.cambodiapostbank.accountonline.cpbank.domain.otp.service;

import com.cambodiapostbank.accountonline.cpbank.domain.otp.dto.SendOtpRequestDto;
import com.cambodiapostbank.accountonline.cpbank.domain.otp.dto.VerifyOTPRequestDto;
import com.cambodiapostbank.accountonline.cpbank.utils.http.CpbHttpClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;

@Slf4j
@Service
public class OtpServiceImpl implements OtpService {

    private final CpbHttpClient httpClient;

    @Autowired
    public OtpServiceImpl(CpbHttpClient httpClient) {
        this.httpClient = httpClient;
    }

    @Override
    public boolean sendOtp(SendOtpRequestDto sendOtpRequestDto) throws IOException {
        Object response = sendOtpRaw(sendOtpRequestDto);

        // Consider it successful if we get a positive number or object response
        if (response instanceof Integer) {
            return (Integer) response > 0;
        }

        return response != null;
    }

    @Override
    public Object sendOtpRaw(SendOtpRequestDto sendOtpRequestDto) throws IOException {
        HttpURLConnection response = httpClient.post("api/sms", sendOtpRequestDto.toJSON());

        // Log the response details including headers
        log.info("SMS API Response - Status Code: {}, URL: {}, Headers: {}",
                response.getResponseCode(), response.getURL(), response.getHeaderFields());

        if (response.getResponseCode() == HttpURLConnection.HTTP_OK) {
            // Read the response body
            BufferedReader reader = new BufferedReader(new InputStreamReader(response.getInputStream()));
            StringBuilder responseBody = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                responseBody.append(line);
            }
            reader.close();

            String responseText = responseBody.toString().trim();

            // Console-style logging of response data
            log.info("SMS API Response Body: {}", responseText);
            log.info("Response details - Length: {} chars, Raw: [{}]",
                    responseText.length(), responseText);

            try {
                // Try to parse as integer (the C# API returns integers for OTP codes and error codes)
                Integer result = Integer.parseInt(responseText);
                log.info("Parsed response as integer: {}", result);
                return result;
            } catch (NumberFormatException e) {
                // If not an integer, return as string
                log.info("Response is not an integer, returning as string: {}", responseText);
                return responseText;
            }
        } else {
            // Handle error responses
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(response.getErrorStream()));
            StringBuilder errorBody = new StringBuilder();
            String line;
            while ((line = errorReader.readLine()) != null) {
                errorBody.append(line);
            }
            errorReader.close();

            String errorText = errorBody.toString();

            // Console-style logging of error data
            log.info("SMS API Error Body: {}", errorText);
            log.info("Error details - Status: {}, Length: {} chars",
                    response.getResponseCode(), errorText.length());

            // Check for ban-related errors
            if (errorText.contains("TOO_MANY_ATTEMPTS")) {
                log.info("Too many attempts detected, throwing RuntimeException");
                throw new RuntimeException(errorText);
            }

            throw new IOException("Failed to send OTP: " + errorText);
        }
    }

    @Override
    public boolean verifyOtp(VerifyOTPRequestDto requestDto) throws IOException {
        HttpURLConnection response = httpClient.post("api/verifyOtp", requestDto.toJSON());

        if (response.getResponseCode() == HttpURLConnection.HTTP_OK) {
            // Read success response
            BufferedReader reader = new BufferedReader(new InputStreamReader(response.getInputStream()));
            StringBuilder responseBody = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                responseBody.append(line);
            }
            reader.close();

            String responseText = responseBody.toString();

            // Check if the response indicates success
            return responseText.contains("OK") || responseText.contains("OTP_VERIFIED");
        } else {
            // Handle error responses from C# API
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(response.getErrorStream()));
            StringBuilder errorBody = new StringBuilder();
            String line;
            while ((line = errorReader.readLine()) != null) {
                errorBody.append(line);
            }
            errorReader.close();

            String errorText = errorBody.toString();

            // Parse the error response to extract specific error messages
            if (errorText.contains("OTP_EXPIRED")) {
                throw new RuntimeException("OTP_EXPIRED");
            } else if (errorText.contains("OTP_INVALID")) {
                throw new RuntimeException("OTP_INVALID");
            } else if (errorText.contains("TOO_MANY_ATTEMPTS")) {
                // Extract the full message including the time (e.g., "TOO_MANY_ATTEMPTS-299.2573603")
                throw new RuntimeException(errorText);
            } else {
                throw new RuntimeException("OTP_INVALID");
            }
        }
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