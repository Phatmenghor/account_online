package com.cambodiapostbank.accountonline.cpbank.controller;


import com.cambodiapostbank.accountonline.cpbank.domain.customer.dto.CustomerRequestDto;
import com.cambodiapostbank.accountonline.cpbank.domain.customer.dto.CustomerResponseDto;
import com.cambodiapostbank.accountonline.cpbank.domain.customer.service.CustomerService;
<<<<<<< HEAD
import com.cambodiapostbank.accountonline.cpbank.utils.http.HttpClient;
=======

import com.cambodiapostbank.accountonline.cpbank.utils.http.HttpClientRest;
>>>>>>> customer_register_v1
import lombok.RequiredArgsConstructor;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
<<<<<<< HEAD
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/openAcct")
=======
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/")
>>>>>>> customer_register_v1
public class OpenAcctController {
    private final Log logger = LogFactory.getLog(OpenAcctController.class);
    private final CustomerService customerService;

<<<<<<< HEAD
    @Value("${t24api.base_url}")
    String BaseUrl;
    @Value("${t24api.username}")
    String USERNAME;
    @Value("${t24api.password}")
    String PASSWORD;

    private String jsonRequestVerifyOtp(CustomerRequestDto customerRequestDto) {
=======
    private final HttpClientRest httpClientRest = new HttpClientRest();

    @Value("${t24api.base_url}")
    private String BaseUrl;

    @Value("${t24api.username}")
    private String USERNAME;

    @Value("${t24api.password}")
    private String PASSWORD;

    private String createJsonRequestVerifyOtp(CustomerRequestDto customerRequestDto) {
>>>>>>> customer_register_v1
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("phone_number", customerRequestDto.getPhoneNumber());
            jsonObject.put("otp_code", customerRequestDto.getOtpCode());
        } catch (JSONException e) {
<<<<<<< HEAD
=======
            logger.error("Error while creating OTP verification JSON request", e);
>>>>>>> customer_register_v1
        }
        return jsonObject.toString();
    }

<<<<<<< HEAD

    @PostMapping("/customer-create")
    public ResponseEntity<Object> registerByCustomer(@RequestBody CustomerRequestDto customerRequestDto) throws Exception {
        logger.info("==================================================================\r\n");
        logger.info("Method Post incoming request.");
        logger.info("==================================================================\r\n");

        String json = jsonRequestVerifyOtp(customerRequestDto);
        String otpUrl = BaseUrl + "/api/IsVerifyOtp";
        String otpResponse = HttpClient.postData(otpUrl, json, USERNAME, PASSWORD);

        logger.info("==================================================================\r\n");
        logger.info("otpResponse: " + otpResponse);
        JSONObject jsonObjectOTP = new JSONObject(otpResponse);
        int errorCodeOTP = jsonObjectOTP.getInt("ErrCode");
        String errorMsgOTP = jsonObjectOTP.getString("ErrMsg");
        logger.info("==================================================================\r\n");

        if (errorCodeOTP == 200) {
            try {
                String jsonRequest = customerService.createJsonRequestCustomerPost(customerRequestDto);
                logger.info("JSON Request: " + jsonRequest);

                String openAcctUrl = BaseUrl + "/api/OpenAcct";
                String response = HttpClient.postData(openAcctUrl, jsonRequest, USERNAME, PASSWORD);
                logger.info("Response: " + response);

                JSONObject jsonObject = new JSONObject(response);
                String errorCode = jsonObject.getString("ErrCode");
                String errorMsg = jsonObject.getString("Content");
                logger.info("StatusCode: " + errorCode);
                logger.info("Message: " + errorMsg);

                return ResponseEntity.ok(response);
            } catch (JSONException e) {
                // Handle JSONException if needed
                logger.error("Error processing JSON response", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing JSON response");
            } catch (Exception e) {
                logger.error("Unexpected error occurred", e);
                throw new RuntimeException(e);
            }
        } else {
            // Handle exceptions appropriately and return error response
            CustomerResponseDto customerResponseDto = new CustomerResponseDto();
            customerResponseDto.setContent("The Invalid OTP code.");
            customerResponseDto.setErrorCode("500");
            customerResponseDto.setErrorMessage("OTP verification failed");
            return ResponseEntity.ok(customerResponseDto);
        }
    }

    @PostMapping("/staff-create")
    public ResponseEntity<Object> registerByStaff(@RequestBody CustomerRequestDto customerRequestDto, HttpSession session) throws Exception {
        logger.info("==================================================================\r\n");
        logger.info("Method Post incoming request.");
        logger.info("==================================================================\r\n");

        String json = jsonRequestVerifyOtp(customerRequestDto);
        String otpUrl = BaseUrl + "/api/IsVerifyOtp";
        String otpResponse = HttpClient.postData(otpUrl, json, USERNAME, PASSWORD);

        logger.info("==================================================================\r\n");
        logger.info("otpResponse: " + otpResponse);
        JSONObject jsonObjectOTP = new JSONObject(otpResponse);
        int errorCodeOTP = jsonObjectOTP.getInt("ErrCode");
        String errorMsgOTP = jsonObjectOTP.getString("ErrMsg");
        logger.info("==================================================================\r\n");
        if (errorCodeOTP == 200){
            try {
                String jsonRequest = customerService.createJsonRequestStaffPost(customerRequestDto,session);
                System.out.println("=======================================");
                System.out.println(jsonRequest);
                System.out.println("=======================================");

                String url = BaseUrl + "/api/OpenAcctByStaff";
                String response = HttpClient.postData(url, jsonRequest, USERNAME, PASSWORD);

                System.out.println("============================================");
                System.out.println("response: " + response);
                System.out.println("===========================================");

                JSONObject jsonObject = new JSONObject(response);
                String errorCode = jsonObject.getString("ErrCode");
                String errorMsg = jsonObject.getString("Content");

                System.out.println("=======================================");
                System.out.println("statusCode: " + errorCode);
                System.out.println("message: " + errorMsg);
                System.out.println("=======================================");

                return ResponseEntity.ok(response);
            } catch (JSONException e) {
                // Handle JSONException if needed
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Invalid response format");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
            }
        }else{
            // Handle exceptions appropriately and return error response
            CustomerResponseDto customerResponseDto = new CustomerResponseDto();
            customerResponseDto.setContent("The Invalid OTP code.");
            customerResponseDto.setErrorCode("500");
            customerResponseDto.setErrorMessage("OTP verification failed");
            return ResponseEntity.ok(customerResponseDto);
        }
    }
}


=======
    @PostMapping("/customer-register")
    public ResponseEntity<?> registerByCustomer(@RequestBody CustomerRequestDto customerRequestDto) throws Exception {
        logger.info("[Customer Creation] Incoming request to register a customer.");

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
    }
}
>>>>>>> customer_register_v1
