package com.cambodiapostbank.accountonline.cpbank.controller;


import com.cambodiapostbank.accountonline.cpbank.domain.staff_info.StaffRequestDTO;
import com.cambodiapostbank.accountonline.cpbank.utils.http.HttpClientRest;
import lombok.RequiredArgsConstructor;
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

    @RequestMapping(value = "/check-login", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<String> checkLogin(@RequestBody StaffRequestDTO staffRequestDTO, HttpSession session) throws Exception {
        String jsonData = createJsonRequestLogin(staffRequestDTO);
        String url = BaseUrl + "/api/Auth/Login";
        String response = httpClientRest.postData(url, jsonData, USERNAME, PASSWORD);
        try {
            JSONObject jsonObject = new JSONObject(response);
            int errCode = jsonObject.getInt("ErrCode");
            if (errCode == 0) {
                session.setAttribute("IsLoginCode", staffRequestDTO.getIdCard());
            } else if (errCode == 2) {
                session.setAttribute("IsChangePasswordCode", staffRequestDTO.getIdCard());
            } else if (errCode == 3) {
                session.setAttribute("IsExpiredPasswordCode", staffRequestDTO.getIdCard());
            }
        } catch (JSONException e) {
        }
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/change-password", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<String> changePassword(@RequestBody StaffRequestDTO staffRequestDTO, HttpSession session) throws Exception {
        String jsonData = createJsonRequestChangePassword(staffRequestDTO, session);
        String url = BaseUrl + "/api/ChangeDefaultPassword";
        String response = httpClientRest.postData(url, jsonData, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/change-exp-password", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<String> changeExpPassword(@RequestBody StaffRequestDTO staffRequestDTO, HttpSession session) throws Exception {
        String jsonData = createJsonRequestExpChangePassword(staffRequestDTO, session);
        String url = BaseUrl + "/api/ChangeDefaultPassword";
        String response = httpClientRest.postData(url, jsonData, USERNAME, PASSWORD);
        return ResponseEntity.ok(response);
    }

    private String createJsonRequestChangePassword(StaffRequestDTO staffRequestDTO, HttpSession session) {
        JSONObject jsonObject = new JSONObject();
        String staffID = (String) session.getAttribute("IsChangePasswordCode");
        System.out.println(staffID);
        try {

            jsonObject.put("id_card", staffID);
            jsonObject.put("password", staffRequestDTO.getPassword());
        } catch (JSONException e) {
        }
        return jsonObject.toString();
    }

    private String createJsonRequestExpChangePassword(StaffRequestDTO staffRequestDTO, HttpSession session) {
        JSONObject jsonObject = new JSONObject();
        String staffID = (String) session.getAttribute("IsExpiredPasswordCode");
        System.out.println(staffID);
        try {

            jsonObject.put("id_card", staffID);
            jsonObject.put("password", staffRequestDTO.getPassword());
        } catch (JSONException e) {
        }
        return jsonObject.toString();
    }

    private String createJsonRequestLogin(StaffRequestDTO staffRequestDTO) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("id_card", staffRequestDTO.getIdCard());
            jsonObject.put("password", staffRequestDTO.getPassword());
        } catch (JSONException e) {
        }
        return jsonObject.toString();
    }
}
