package com.cambodiapostbank.accountonline.cpbank.controller;

import com.cambodiapostbank.accountonline.cpbank.utils.http.HttpClientRest;
import lombok.RequiredArgsConstructor;
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

    HttpClientRest httpClientRest = new HttpClientRest();

    @Value("${t24api.base_url}")
    String BaseUrl;

    @Value("${t24api.username}")
    String USERNAME;

    @Value("${t24api.password}")
    String PASSWORD;

    @GetMapping("/getBranch")
    public ResponseEntity<String> getBranch() throws Exception {
        String URL = BaseUrl + "/api/GET_BRANCH_KH";
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getLoanOfficer")
    public ResponseEntity<String> getLoanOfficer() throws Exception {
        String URL = BaseUrl + "/api/GetLoanOfficer";
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getPro")
    public ResponseEntity<String> getProvince() throws Exception {
        String URL = BaseUrl + "/api/Province";
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getDis/{reqNo}")
    public ResponseEntity<String> getDis(@PathVariable(value = "reqNo") String reqNo) throws Exception {
        if (reqNo == null || reqNo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        String URL = BaseUrl + "/api/District/" + reqNo;
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getCom/{reqNo}")
    public ResponseEntity<String> getCom(@PathVariable(value = "reqNo") String reqNo) throws Exception {
        if (reqNo == null || reqNo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        String URL = BaseUrl + "/api/Commune/" + reqNo;
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getVil/{reqNo}")
    public ResponseEntity<String> getVil(@PathVariable(value = "reqNo") String reqNo) throws Exception {
        if (reqNo == null || reqNo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        String URL = BaseUrl + "/api/Village/" + reqNo;
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getListType/{type}")
    public ResponseEntity<String> getListType(@PathVariable(value = "type") String type) throws Exception {
        if (type == null || type.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        System.out.println("========================");
        System.out.println("getType= " + type);
        System.out.println("========================");

        String URL = BaseUrl + "/api/Get_List_Data/" + type;
        String response = httpClientRest.getData(URL, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }
}
