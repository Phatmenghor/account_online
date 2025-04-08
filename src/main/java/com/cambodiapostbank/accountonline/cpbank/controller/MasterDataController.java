package com.cambodiapostbank.accountonline.cpbank.controller;

import com.cambodiapostbank.accountonline.cpbank.domain.customer.dto.CustomerRequestDto;
import com.cambodiapostbank.accountonline.cpbank.domain.customer.service.CustomerService;
import com.cambodiapostbank.accountonline.cpbank.domain.otp.dto.VerifyOTPRequestDto;
import com.cambodiapostbank.accountonline.cpbank.domain.otp.service.OtpService;
import com.cambodiapostbank.accountonline.cpbank.utils.http.HttpClient;

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
    
    @Value("${t24api.base_url}")
    String BaseUrl;
    @Value("${t24api.username}")
    String USERNAME;
    @Value("${t24api.password}")
    String PASSWORD;

    @GetMapping("/getBranch")
    public ResponseEntity<String> getBranch() throws Exception {
        String Url = BaseUrl + "/api/GET_BRANCH_KH";
        String response = HttpClient.getData(Url, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/getLoanOfficer")
    public ResponseEntity<String> getLoanOfficer() throws Exception {
        String Url = BaseUrl + "/api/GetLoanOfficer";
        String response = HttpClient.getData(Url, USERNAME, PASSWORD);

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
>>>>>>> customer_register_v1
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getPro")
    public ResponseEntity<String> getProvince() throws Exception {
<<<<<<< HEAD
        String Url = BaseUrl + "/api/Province";
        String response = HttpClient.getData(Url, USERNAME, PASSWORD);
=======
        String URL = BaseUrl + "/api/Province";
        logger.info("Fetching province data from: " + URL);
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        logger.info("Province data retrieved successfully.");
>>>>>>> customer_register_v1
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getDis/{reqNo}")
    public ResponseEntity<String> getDis(@PathVariable(value = "reqNo") String reqNo) throws Exception {
        if (reqNo == null || reqNo.isEmpty()) {
<<<<<<< HEAD
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        String Url = BaseUrl + "/api/District/" + reqNo;
        String response = HttpClient.getData(Url, USERNAME, PASSWORD);
=======
            logger.warn("Invalid request: reqNo parameter is missing or empty.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        String URL = BaseUrl + "/api/District/" + reqNo;
        logger.info("Fetching district data for: " + reqNo);
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        logger.info("District data retrieved successfully.");
>>>>>>> customer_register_v1
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getCom/{reqNo}")
    public ResponseEntity<String> getCom(@PathVariable(value = "reqNo") String reqNo) throws Exception {
        if (reqNo == null || reqNo.isEmpty()) {
<<<<<<< HEAD
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        String Url = BaseUrl + "/api/Commune/" + reqNo;
        String response = HttpClient.getData(Url, USERNAME, PASSWORD);
=======
            logger.warn("Invalid request: reqNo parameter is missing or empty.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        String URL = BaseUrl + "/api/Commune/" + reqNo;
        logger.info("Fetching commune data for: " + reqNo);
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        logger.info("Commune data retrieved successfully.");
>>>>>>> customer_register_v1
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getVil/{reqNo}")
    public ResponseEntity<String> getVil(@PathVariable(value = "reqNo") String reqNo) throws Exception {
        if (reqNo == null || reqNo.isEmpty()) {
<<<<<<< HEAD
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        String Url = BaseUrl + "/api/Village/" + reqNo;
        String response = HttpClient.getData(Url, USERNAME, PASSWORD);
=======
            logger.warn("Invalid request: reqNo parameter is missing or empty.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        String URL = BaseUrl + "/api/Village/" + reqNo;
        logger.info("Fetching village data for: " + reqNo);
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        logger.info("Village data retrieved successfully.");
>>>>>>> customer_register_v1
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getListType/{type}")
    public ResponseEntity<String> getListType(@PathVariable(value = "type") String type) throws Exception {
        if (type == null || type.isEmpty()) {
<<<<<<< HEAD
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        System.out.println("========================");
        System.out.println("getType= " + type);
        System.out.println("========================");

        String Url = BaseUrl + "/api/Get_List_Data/" + type;
        String response = HttpClient.getData(Url, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }
}
=======
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
>>>>>>> customer_register_v1
