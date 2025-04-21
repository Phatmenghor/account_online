package com.cambodiapostbank.accountonline.cpbank.controller;

import com.cambodiapostbank.accountonline.cpbank.utils.http.HttpClientRest;
import lombok.RequiredArgsConstructor;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/masterData")
public class MasterDataController {

    private final HttpClientRest httpClientRest = new HttpClientRest();
    private final Log logger = LogFactory.getLog(MasterDataController.class);

    @Value("${t24api.base_url}")
    private String BaseUrl;

    @Value("${t24api.username}")
    private String USERNAME;

    @Value("${t24api.password}")
    private String PASSWORD;

    @GetMapping("/getBranch")
    public ResponseEntity<String> getBranch() throws Exception {
        String URL = BaseUrl + "/api/GET_BRANCH_KH";
        logger.info("Fetching branch data from: " + URL);
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        logger.info("Branch data retrieved successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getLoanOfficer")
    public ResponseEntity<String> getLoanOfficer() throws Exception {
        String URL = BaseUrl + "/api/GetLoanOfficer";
        logger.info("Fetching loan officer data from: " + URL);
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        logger.info("Loan officer data retrieved successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getPro")
    public ResponseEntity<String> getProvince() throws Exception {
        String URL = BaseUrl + "/api/Province";
        logger.info("Fetching province data from: " + URL);
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        logger.info("Province data retrieved successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getDis/{reqNo}")
    public ResponseEntity<String> getDis(@PathVariable(value = "reqNo") String reqNo) throws Exception {
        if (reqNo == null || reqNo.isEmpty()) {
            logger.warn("Invalid request: reqNo parameter is missing or empty.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }

        String URL = BaseUrl + "/api/District/" + reqNo;
        logger.info("Fetching district data for: " + reqNo);
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        logger.info("District data retrieved successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getCom/{reqNo}")
    public ResponseEntity<String> getCom(@PathVariable(value = "reqNo") String reqNo) throws Exception {
        if (reqNo == null || reqNo.isEmpty()) {
            logger.warn("Invalid request: reqNo parameter is missing or empty.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        String URL = BaseUrl + "/api/Commune/" + reqNo;
        logger.info("Fetching commune data for: " + reqNo);
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        logger.info("Commune data retrieved successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getVil/{reqNo}")
    public ResponseEntity<String> getVil(@PathVariable(value = "reqNo") String reqNo) throws Exception {
        if (reqNo == null || reqNo.isEmpty()) {
            logger.warn("Invalid request: reqNo parameter is missing or empty.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        String URL = BaseUrl + "/api/Village/" + reqNo;
        logger.info("Fetching village data for: " + reqNo);
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        logger.info("Village data retrieved successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getListType/{type}")
    public ResponseEntity<String> getListType(@PathVariable(value = "type") String type) throws Exception {
        if (type == null || type.isEmpty()) {
            logger.warn("Invalid request: type parameter is missing or empty.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: type parameter is missing or empty.");
        }
        logger.info("Fetching list data for type: " + type);
        String URL = BaseUrl + "/api/Get_List_Data/" + type;
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        logger.info("List data retrieved successfully for type: " + type);
        return ResponseEntity.ok(response);
    }
}