package com.cambodiapostbank.accountonline.cpbank.controller;


import com.cambodiapostbank.accountonline.cpbank.domain.customer.dto.CustomerRequestDto;
import com.cambodiapostbank.accountonline.cpbank.domain.customer.dto.CustomerResponseDto;
import com.cambodiapostbank.accountonline.cpbank.domain.customer.service.CustomerService;
import com.cambodiapostbank.accountonline.cpbank.utils.http.HttpClientRest;
import lombok.RequiredArgsConstructor;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/openAcct")
public class OpenAcctController {
    private final Log logger = LogFactory.getLog(OpenAcctController.class);
    private final CustomerService customerService;

    private final HttpClientRest httpClientRest = new HttpClientRest();

    @Value("${t24api.base_url}")
    private String BaseUrl;
    @Value("${t24api.username}")
    private String USERNAME;
    @Value("${t24api.password}")
    private String PASSWORD;

    private String createJsonRequestVerifyOtp(CustomerRequestDto customerRequestDto) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("phone_number", customerRequestDto.getPhoneNumber());
            jsonObject.put("otp_code", customerRequestDto.getOtpCode());
        } catch (JSONException e) {
            logger.error("Error while creating OTP verification JSON request", e);
        }
        return jsonObject.toString();
    }

    @PostMapping("/customer-create")
    public ResponseEntity<Object> registerByCustomer(@RequestBody CustomerRequestDto customerRequestDto) throws Exception {
        logger.info("[Customer Creation] Incoming request to register a customer.");

        String JSON_DATA_OTP = createJsonRequestVerifyOtp(customerRequestDto);
        String OTP_URL = BaseUrl + "/api/IsVerifyOtp";
        logger.info("[OTP Verification] Sending request to: " + OTP_URL);
        String otpResponse = httpClientRest.postData(OTP_URL, JSON_DATA_OTP, USERNAME, PASSWORD);
        logger.info("[OTP Verification] Response received: " + otpResponse);

        JSONObject jsonObjectOTP = new JSONObject(otpResponse);
        int errorCodeOTP = jsonObjectOTP.getInt("ErrCode");
        String errorMsgOTP = jsonObjectOTP.getString("ErrMsg");

        if (errorCodeOTP == 200) {
            try {
                String jsonRequest = customerService.createJsonRequestCustomerPost(customerRequestDto);
                logger.info("[Customer Creation] Request Payload: " + jsonRequest);

                String openAcctUrl = BaseUrl + "/api/OpenAcct";
                logger.info("[Customer Creation] Sending request to: " + openAcctUrl);
                String response = httpClientRest.postData(openAcctUrl, jsonRequest, USERNAME, PASSWORD);
                logger.info("[Customer Creation] Response received: " + response);

                return ResponseEntity.ok(response);
            } catch (JSONException e) {
                logger.error("[Customer Creation] Error processing JSON response", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing JSON response");
            } catch (Exception e) {
                logger.error("[Customer Creation] Unexpected error occurred", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
            }
        } else {
            logger.warn("[OTP Verification] Failed: " + errorMsgOTP);
            CustomerResponseDto customerResponseDto = new CustomerResponseDto();
            customerResponseDto.setContent("Invalid OTP code.");
            customerResponseDto.setErrorCode("500");
            customerResponseDto.setErrorMessage("OTP verification failed");
            return ResponseEntity.ok(customerResponseDto);
        }
    }

    @PostMapping("/staff-create")
    public ResponseEntity<Object> registerByStaff(@RequestBody CustomerRequestDto customerRequestDto, HttpSession session) throws Exception {
        logger.info("[Staff Creation] Incoming request to register a staff account.");

        String JSON_DATA = createJsonRequestVerifyOtp(customerRequestDto);
        String OTP_URL = BaseUrl + "/api/IsVerifyOtp";
        logger.info("[OTP Verification] Sending request to: " + OTP_URL);
        String otpResponse = httpClientRest.postData(OTP_URL, JSON_DATA, USERNAME, PASSWORD);
        logger.info("[OTP Verification] Response received: " + otpResponse);

        JSONObject jsonObjectOTP = new JSONObject(otpResponse);
        int errorCodeOTP = jsonObjectOTP.getInt("ErrCode");
        String errorMsgOTP = jsonObjectOTP.getString("ErrMsg");

        if (errorCodeOTP == 200) {
            try {
                String jsonRequest = customerService.createJsonRequestStaffPost(customerRequestDto, session);
                logger.info("[Staff Creation] Request Payload: " + jsonRequest);

                String URL = BaseUrl + "/api/OpenAcctByStaff";
                logger.info("[Staff Creation] Sending request to: " + URL);
                String response = httpClientRest.postData(URL, jsonRequest, USERNAME, PASSWORD);
                logger.info("[Staff Creation] Response received: " + response);

                return ResponseEntity.ok(response);
            } catch (JSONException e) {
                logger.error("[Staff Creation] Error processing JSON response", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Invalid response format");
            } catch (Exception e) {
                logger.error("[Staff Creation] Unexpected error occurred", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
            }
        } else {
            logger.warn("[OTP Verification] Failed: " + errorMsgOTP);
            CustomerResponseDto customerResponseDto = new CustomerResponseDto();
            customerResponseDto.setContent("Invalid OTP code.");
            customerResponseDto.setErrorCode("500");
            customerResponseDto.setErrorMessage("OTP verification failed");
            return ResponseEntity.ok(customerResponseDto);
        }
    }
}