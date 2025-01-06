package com.cambodiapostbank.accountonline.cpbank.controller;


import com.cambodiapostbank.accountonline.cpbank.model.StaffRequest;
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
import org.springframework.web.servlet.view.RedirectView;

import javax.servlet.http.HttpSession;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {
    HttpClientRest httpClientRest = new HttpClientRest();
    private static final Logger logger = LogManager.getLogger(AuthController.class);

    @Value("${t24api.base_url}")
    String BaseUrl;

    @Value("${t24api.username}")
    String USERNAME;

    @Value("${t24api.password}")
    String PASSWORD;

    @GetMapping("/logout")
    public RedirectView logout(HttpSession session) {
        // Clear session attributes or invalidate the session
        session.invalidate();

        // Create a RedirectView to the login page
        RedirectView redirectView = new RedirectView("/OpenUat/login-page");
        redirectView.setStatusCode(HttpStatus.MOVED_PERMANENTLY);
        return redirectView;
    }

    @PostMapping("/check-login")
    public ResponseEntity<String> checkLogin(@RequestBody StaffRequest staffRequest, HttpSession session) throws Exception {
        String JSON_DATA = createJsonRequestLogin(staffRequest);
        String URL = BaseUrl + "/api/Auth/Login";
        String response = httpClientRest.postData(URL, JSON_DATA, USERNAME, PASSWORD);
        logger.info(response);
        try {
            JSONObject jsonObject = new JSONObject(response);
            int errCode = jsonObject.getInt("ErrCode");
            if (errCode == 0) {
                session.setAttribute("IsLoginCode", staffRequest.getIdCard());
            } else if (errCode == 2) {
                session.setAttribute("IsChangePasswordCode", staffRequest.getIdCard());
            } else if (errCode == 3) {
                session.setAttribute("IsExpiredPasswordCode", staffRequest.getIdCard());
            }
        } catch (JSONException e) {
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody StaffRequest staffRequest, HttpSession session) throws Exception {
        String JSON_DATA = createJsonRequestChangePassword(staffRequest, session);
        String URL = BaseUrl + "/api/ChangeDefaultPassword";
        String response = httpClientRest.postData(URL, JSON_DATA, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-exp-password")
    public ResponseEntity<String> changeExpPassword(@RequestBody StaffRequest staffRequest, HttpSession session) throws Exception {
        String JSON_DATA = createJsonRequestExpChangePassword(staffRequest, session);
        String URL = BaseUrl + "/api/ChangeDefaultPassword";
        String response = httpClientRest.postData(URL, JSON_DATA, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    private String createJsonRequestChangePassword(StaffRequest staffRequest, HttpSession session) {
        JSONObject jsonObject = new JSONObject();
        String staffID = (String) session.getAttribute("IsChangePasswordCode");
        System.out.println(staffID);
        try {
            jsonObject.put("id_card", staffID);
            jsonObject.put("password", staffRequest.getPassword());
        } catch (JSONException e) {
        }
        return jsonObject.toString();
    }

    private String createJsonRequestExpChangePassword(StaffRequest staffRequest, HttpSession session) {
        JSONObject jsonObject = new JSONObject();
        String staffID = (String) session.getAttribute("IsExpiredPasswordCode");
        System.out.println(staffID);
        try {

            jsonObject.put("id_card", staffID);
            jsonObject.put("password", staffRequest.getPassword());
        } catch (JSONException e) {
        }
        return jsonObject.toString();
    }

    private String createJsonRequestLogin(StaffRequest staffRequest) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("id_card", staffRequest.getIdCard());
            jsonObject.put("password", staffRequest.getPassword());
        } catch (JSONException e) {
        }
        return jsonObject.toString();
    }
}
