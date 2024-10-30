package com.cambodiapostbank.accountonline.cpbank.controller;

import com.cambodiapostbank.accountonline.cpbank.domain.EKYC.dto.AddressPOBRequestDTO;
import com.cambodiapostbank.accountonline.cpbank.domain.EKYC.dto.AddressRequestDTO;
import com.cambodiapostbank.accountonline.cpbank.domain.EKYC.dto.EkycRequestDataDTO;
import com.cambodiapostbank.accountonline.cpbank.domain.EKYC.dto.KhmerIDRequestDTO;
import com.cambodiapostbank.accountonline.cpbank.utils.FormatDate;
import com.cambodiapostbank.accountonline.cpbank.utils.http.HttpClientRest;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ekyc")
public class EKYCController {

    // Define a logger
    private static final Logger logger = LogManager.getLogger(EKYCController.class);


    HttpClientRest httpClientRest = new HttpClientRest();

    @Value("${t24api.base_url}")
    String BaseUrl;

    @Value("${t24api.username}")
    String USERNAME;

    @Value("${t24api.password}")
    String PASSWORD;

    @PostMapping("/extractNid")
    public ResponseEntity<String> extractNid(@RequestBody KhmerIDRequestDTO khmerIDRequestDTO, HttpServletRequest request) throws Exception {
        String JSON_DATA = createJsonRequestExtractNid(khmerIDRequestDTO);
        String URL = BaseUrl + "/api/ExtractNid";
        String response = httpClientRest.postData(URL, JSON_DATA, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verifyAddress")
    public ResponseEntity<String> VerifyAddress(@RequestBody AddressRequestDTO addressRequestDTO, HttpServletRequest request) throws Exception {
        String JSON_DATA = createJsonCheckAddress(addressRequestDTO);
        String URL = BaseUrl + "/api/CheckAddress";
        String response = httpClientRest.postData(URL, JSON_DATA, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verifyPOBAddress")
    public ResponseEntity<String> verifyPOBAddress(@RequestBody AddressPOBRequestDTO addressRequestDTO, HttpServletRequest request) throws Exception {
        String JSON_DATA = createJsonCheckPob(addressRequestDTO);
        String URL = BaseUrl + "/api/CheckPOB";
        String response = httpClientRest.postData(URL, JSON_DATA, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/verifyNidFaceImage")
    public ResponseEntity<String> verifyNidFaceImage(@RequestBody EkycRequestDataDTO request) {
        try {
            String JSON_DATA = createJsonValidateNidFace(request);
            logger.info("jsonPayload: {}", JSON_DATA);

            String URL = BaseUrl + "/api/ValidateNIDFace";
            String response = httpClientRest.postData(URL, JSON_DATA, USERNAME, PASSWORD);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log the error details
            logger.error("An error occurred while verifying NID face image", e);

            // Return a meaningful error response
            String errorMessage = "An error occurred while processing the request.";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMessage);
        }
    }

    private String createJsonRequestExtractNid(KhmerIDRequestDTO request) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("idImage", request.getIdImage());
        } catch (JSONException e) {
            logger.error("An error occurred while constructing JSON payload", e);
        }
        return jsonObject.toString();
    }

    private String createJsonValidateNidFace(EkycRequestDataDTO ekycRequestDataDTO) {
        JSONObject jsonObject = new JSONObject();
        try {
            JSONObject userInfoObject = new JSONObject();
            userInfoObject.put("idNumber", ekycRequestDataDTO.getUserInfo().getIdNumber());
            userInfoObject.put("firstNameKh", ekycRequestDataDTO.getUserInfo().getFirstNameKh());
            userInfoObject.put("lastNameKh", ekycRequestDataDTO.getUserInfo().getLastNameKh());
            userInfoObject.put("firstNameEn", ekycRequestDataDTO.getUserInfo().getFirstNameEn());
            userInfoObject.put("lastNameEn", ekycRequestDataDTO.getUserInfo().getLastNameEn());
            userInfoObject.put("gender", ekycRequestDataDTO.getUserInfo().getGender());

            // Format the date of birth
            String dob = FormatDate.formatDate(ekycRequestDataDTO.getUserInfo().getDob());
            userInfoObject.put("dob", dob);

            // Format the issued date
            String issuedDate = FormatDate.formatDate(ekycRequestDataDTO.getUserInfo().getIssuedDate());
            userInfoObject.put("issuedDate", issuedDate);

            // Format the expired date
            String expiredDate = FormatDate.formatDate(ekycRequestDataDTO.getUserInfo().getExpiredDate());
            userInfoObject.put("expiredDate", expiredDate);

            jsonObject.put("userInfo", userInfoObject);
            jsonObject.put("faceImg", ekycRequestDataDTO.getFaceImg());
            jsonObject.put("idImage", ekycRequestDataDTO.getIdImage());
        } catch (JSONException e) {
            // Handle the exception appropriately
            logger.error("Error creating JSON payload", e);
            e.printStackTrace();
        }
        return jsonObject.toString();
    }

    private String createJsonCheckAddress(AddressRequestDTO addressRequestDTO) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("customer_address", addressRequestDTO.getCustomer_address());
        } catch (JSONException e) {
            logger.error(e.getMessage());
        }
        return jsonObject.toString();
    }

    private String createJsonCheckPob(AddressPOBRequestDTO addressRequestDTO) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("customer_pob_address", addressRequestDTO.getCustomer_pob_address());
        } catch (JSONException e) {
        }
        return jsonObject.toString();
    }
}
