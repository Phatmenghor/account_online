package com.cambodiapostbank.accountonline.cpbank.controller;

import com.cambodiapostbank.accountonline.cpbank.domain.customer.dto.CustomerRequestDto;
import com.cambodiapostbank.accountonline.cpbank.domain.customer.service.CustomerService;
import com.cambodiapostbank.accountonline.cpbank.domain.otp.dto.VerifyOTPRequestDto;
import com.cambodiapostbank.accountonline.cpbank.domain.otp.service.OtpService;
import com.cambodiapostbank.accountonline.cpbank.utils.http.HttpClient;
import lombok.RequiredArgsConstructor;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.validation.Valid;

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
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getPro")
    public ResponseEntity<String> getProvince() throws Exception {
        String Url = BaseUrl + "/api/Province";
        String response = HttpClient.getData(Url, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getDis/{reqNo}")
    public ResponseEntity<String> getDis(@PathVariable(value = "reqNo") String reqNo) throws Exception {
        if (reqNo == null || reqNo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        String Url = BaseUrl + "/api/District/" + reqNo;
        String response = HttpClient.getData(Url, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getCom/{reqNo}")
    public ResponseEntity<String> getCom(@PathVariable(value = "reqNo") String reqNo) throws Exception {
        if (reqNo == null || reqNo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        String Url = BaseUrl + "/api/Commune/" + reqNo;
        String response = HttpClient.getData(Url, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getVil/{reqNo}")
    public ResponseEntity<String> getVil(@PathVariable(value = "reqNo") String reqNo) throws Exception {
        if (reqNo == null || reqNo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: reqNo parameter is missing or empty.");
        }
        String Url = BaseUrl + "/api/Village/" + reqNo;
        String response = HttpClient.getData(Url, USERNAME, PASSWORD);
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

        String Url = BaseUrl + "/api/Get_List_Data/" + type;
        String response = HttpClient.getData(Url, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }
}
