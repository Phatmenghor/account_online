package com.cambodiapostbank.accountonline.cpbank.controller;

import com.cambodiapostbank.accountonline.cpbank.domain.EKYC.dto.AddressPOBRequestDTO;
import com.cambodiapostbank.accountonline.cpbank.domain.EKYC.dto.AddressRequestDTO;
import com.cambodiapostbank.accountonline.cpbank.domain.EKYC.dto.EkycRequestDataDTO;
import com.cambodiapostbank.accountonline.cpbank.domain.EKYC.dto.KhmerIDRequestDTO;
import com.cambodiapostbank.accountonline.cpbank.utils.FormatDate;
import com.cambodiapostbank.accountonline.cpbank.utils.http.HttpClient;
import com.cambodiapostbank.accountonline.cpbank.utils.http.TrustCert;
import lombok.RequiredArgsConstructor;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ekyc")
public class EKYCController {

    // Define a logger
    private static final Logger logger = LogManager.getLogger(EKYCController.class);


    HttpClient httpClient = new HttpClient();
    @Value("${t24api.base_url}")
    String BaseUrl;
    @Value("${t24api.username}")
    String USERNAME;
    @Value("${t24api.password}")
    String PASSWORD;

    @RequestMapping(value = "/send", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<String> CheckEkyc(@RequestBody KhmerIDRequestDTO khmerIDRequestDTO, HttpServletRequest request) throws Exception {
        String Json = "{'idImage':'" + khmerIDRequestDTO.getIdImage() + "'}";
        String Url = BaseUrl + "/api/EKYC";
        String response = HttpClient.postData(Url, Json, USERNAME, PASSWORD);
        System.out.println(response);
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/verifyAddress", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<String> VerifyAddress(@RequestBody AddressRequestDTO addressRequestDTO, HttpServletRequest request) throws Exception {
        String Json = jsonPayloadCheckAddress(addressRequestDTO);
        String Url = BaseUrl + "/api/CheckAddress";
        String response = HttpClient.postData(Url, Json, USERNAME, PASSWORD);
        System.out.println(response);
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/verifyPOBAddress", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<String> verifyPOBAddress(@RequestBody AddressPOBRequestDTO addressRequestDTO, HttpServletRequest request) throws Exception {
        String Json = jsonPayloadCheckPob(addressRequestDTO);
        String Url = BaseUrl + "/api/CheckPOB";
        String response = HttpClient.postData(Url, Json, USERNAME, PASSWORD);
        System.out.println(response);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/verifyNidFaceImage")
    public ResponseEntity<String> verifyNidFaceImage(@RequestBody EkycRequestDataDTO request) {
        try {
            String jsonPayload = jsonPayloadValidateNidFace(request);
            logger.info("jsonPayload: {}", jsonPayload);

            TrustCert trustCert = new TrustCert();
            trustCert.trustAllCertificate(); // Trust all certificates

            URL url = new URL(BaseUrl + "/api/ValidateNIDFace");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setConnectTimeout(300000); // Set connection timeout to 5 minutes (300,000 milliseconds)
            connection.setReadTimeout(300000); // Set read timeout to 5 minutes (300,000 milliseconds)
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Accept", "application/json");

            // Prepare the payload
            byte[] input = jsonPayload.getBytes(StandardCharsets.UTF_8);
            connection.setRequestProperty("Content-Length", String.valueOf(input.length));

            // Send request
            try (OutputStream os = connection.getOutputStream()) {
                os.write(input);
            }

            int responseCode = connection.getResponseCode();
            logger.info("Response Code: {}", responseCode);

            if (responseCode == HttpURLConnection.HTTP_OK) {
                try (BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                    String response = br.lines().collect(Collectors.joining("\n"));
                    return ResponseEntity.ok(response);
                }
            } else {
                logger.error("Server returned response code: {}", responseCode);
                return ResponseEntity.status(responseCode).body("Error occurred. Response code: " + responseCode);
            }
        } catch (SocketTimeoutException e) {
            logger.error("Connection timed out: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).body("Request timed out.");
        } catch (IOException e) {
            logger.error("I/O error occurred: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("I/O error occurred.");
        } catch (Exception e) {
            logger.error("An unexpected error occurred: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    private String jsonPayloadValidateNidFace(EkycRequestDataDTO ekycRequestDataDTO) {
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

    private String jsonPayloadCheckAddress(AddressRequestDTO addressRequestDTO) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("customer_address", addressRequestDTO.getCustomer_address());
        } catch (JSONException e) {
            logger.error(e.getMessage());
        }
        return jsonObject.toString();
    }

    private String jsonPayloadCheckPob(AddressPOBRequestDTO addressRequestDTO) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("customer_pob_address", addressRequestDTO.getCustomer_pob_address());
        } catch (JSONException e) {
        }
        return jsonObject.toString();
    }
}
