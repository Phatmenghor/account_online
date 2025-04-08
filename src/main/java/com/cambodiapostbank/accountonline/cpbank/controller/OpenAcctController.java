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