package com.cambodiapostbank.accountonline.cpbank.controller;

import com.cambodiapostbank.accountonline.cpbank.domain.eKYC.dto.*;
import com.cambodiapostbank.accountonline.cpbank.utils.DateFormatter;
import com.cambodiapostbank.accountonline.cpbank.utils.http.HttpClientRest;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/eKYC")
public class eKYC_Controller {

    private static final Logger logger = LogManager.getLogger(eKYC_Controller.class);
    private final HttpClientRest httpClientRest = new HttpClientRest();

    @Value("${t24api.base_url}")
    private String baseUrl;

    @Value("${t24api.username}")
    private String username;

    @Value("${t24api.password}")
    private String password;

    @PostMapping("/extract-nid")
    public ResponseEntity<String> extractNid(@RequestBody KhmerIDRequestDTO khmerIDRequestDTO) {
        logger.info("Start: Extract NID processing.");

        String jsonData = createJsonRequestExtractNid(khmerIDRequestDTO);
        String url = baseUrl + "/api/ExtractNid";

        logger.debug("Sending request to URL: {}", url);
        logger.debug("Request Payload: {}", jsonData);

        String response = httpClientRest.postData(url, jsonData, username, password);

        logger.info("Extract NID response received: {}", response);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-address")
    public ResponseEntity<String> verifyAddress(@RequestBody AddressRequestDTO addressRequestDTO, HttpServletRequest request) {
        logger.info("Start: Verify Address processing.");

        String jsonData = createJsonCheckAddress(addressRequestDTO);
        String url = baseUrl + "/api/CheckAddress";

        logger.debug("Sending request to URL: {}", url);
        logger.debug("Request Payload: {}", jsonData);

        String response = httpClientRest.postData(url, jsonData, username, password);

        logger.info("Verify Address response received: {}", response);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-pob-address")
    public ResponseEntity<String> verifyPOBAddress(@RequestBody AddressPOBRequestDTO addressRequestDTO, HttpServletRequest request) {
        logger.info("Start: Verify Place of Birth Address processing.");

        String jsonData = createJsonCheckPob(addressRequestDTO);
        String url = baseUrl + "/api/CheckPOB";

        logger.debug("Sending request to URL: {}", url);

        logger.debug("Request Payload: {}", jsonData);

        String response = httpClientRest.postData(url, jsonData, username, password);

        logger.info("Verify POB Address response received: {}", response);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate-nid")
    public ResponseEntity<String> verifyNidFaceImage(@RequestBody ValidateNidRequest request) {
        logger.info("Start: Validate NID Face Image processing.");

        try {
            String jsonData = validateNid(request);
            String url = baseUrl + "/api/ValidateNid";

            logger.info("Sending request to URL: {}", url);
            logger.info("Request Payload: {}", jsonData);

            String response = httpClientRest.postData(url, jsonData, username, password);

            logger.info("Validate NID Face response received.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error occurred while verifying NID face image: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while processing the request.");
        }
    }

    private String createJsonRequestExtractNid(KhmerIDRequestDTO request) {
        try {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("idImage", request.getIdImage());
            return jsonObject.toString();
        } catch (JSONException e) {
            logger.error("Error constructing JSON payload for Extract NID: ", e);
            return "{}";
        }
    }

    public String validateNid(ValidateNidRequest req) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("applicationName", "ACCOUNT_ONLINE");
            jsonObject.put("idNumber", req.getIdNumber());
            jsonObject.put("firstNameKh", req.getFirstNameKh());
            jsonObject.put("lastNameKh", req.getLastNameKh());
            jsonObject.put("firstNameEn", req.getFirstNameEn());
            jsonObject.put("lastNameEn", req.getLastNameEn());
            jsonObject.put("gender", req.getGender());
            jsonObject.put("dob", DateFormatter.formatDate(req.getDob()));
            jsonObject.put("issuedDate", "2021-11-03");
            jsonObject.put("expiredDate", "2031-11-02");
        } catch (JSONException e) {
            // Handle the exception appropriately
            logger.error("Error creating JSON payload", e);
            e.printStackTrace();
        }
        return jsonObject.toString();
    }

    private String createJsonCheckAddress(AddressRequestDTO addressRequestDTO) {
        try {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("customer_address", addressRequestDTO.getCustomer_address());
            return jsonObject.toString();
        } catch (JSONException e) {
            logger.error("Error constructing JSON payload for Verify Address: ", e);
            return "{}";
        }
    }

    private String createJsonCheckPob(AddressPOBRequestDTO addressRequestDTO) {
        try {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("customer_pob_address", addressRequestDTO.getCustomer_pob_address());
            return jsonObject.toString();
        } catch (JSONException e) {
            logger.error("Error constructing JSON payload for Verify POB Address: ", e);
            return "{}";
        }
    }
}
