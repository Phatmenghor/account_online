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
    private static final Logger logger = LogManager.getLogger(AuthController.class);
    private final HttpClientRest httpClientRest = new HttpClientRest();

    @Value("${t24api.base_url}")
    private String baseUrl;

    @Value("${t24api.username}")
    private String username;

    @Value("${t24api.password}")
    private String password;

    @GetMapping("/logout")
    public RedirectView logout(HttpSession session) {
        logger.info("Logging out and invalidating session.");
        session.invalidate();
        return new RedirectView("/OpenAcct/login", true);
    }

    @PostMapping("/check-login")
    public ResponseEntity<String> checkLogin(@RequestBody StaffRequest staffRequest, HttpSession session) {
        logger.info("Initiating login process for ID: {}", staffRequest.getIdCard());

        String jsonData = createJsonRequestLogin(staffRequest);
        String url = baseUrl + "/api/Auth";

        logger.debug("Sending login request to {} with payload: {}", url, jsonData);

        String response = httpClientRest.postData(url, jsonData, username, password);
        logger.info("Login response received: {}", response);

        try {
            JSONObject jsonObject = new JSONObject(response);
            JSONObject statusObject = jsonObject.getJSONObject("Status");
            int errCode = statusObject.getInt("ErrCode");

            if (errCode == 0) {
                // Extract user details
                JSONObject userObject = jsonObject.getJSONObject("User");
                String fullName = userObject.getString("full_name");
                String idCard = userObject.getString("id_card");
                String branch = userObject.getString("branch");

                // Store user details in session
                session.setAttribute("IsLoginCode", idCard);
                session.setAttribute("FullName", fullName);
                session.setAttribute("Branch", branch);

                logger.info("User logged in successfully: {} (Branch: {})", fullName, branch);
            } else if (errCode == 2) {
                session.setAttribute("IsChangePasswordCode", staffRequest.getIdCard());
            } else if (errCode == 3) {
                session.setAttribute("IsExpiredPasswordCode", staffRequest.getIdCard());
            }
        } catch (JSONException e) {
            logger.error("Error parsing login response: ", e);
        }

        return ResponseEntity.ok(response);
    }


    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody StaffRequest staffRequest, HttpSession session) {
        logger.info("Changing password for user session: {}", session.getAttribute("IsChangePasswordCode"));

        String jsonData = createJsonRequestChangePassword(staffRequest, session);
        String url = baseUrl + "/api/ChangeDefaultPassword";

        logger.debug("Sending change password request to {} with payload: {}", url, jsonData);

        String response = httpClientRest.postData(url, jsonData, username, password);
        logger.info("Change password response received.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-exp-password")
    public ResponseEntity<String> changeExpPassword(@RequestBody StaffRequest staffRequest, HttpSession session) {
        logger.info("Changing expired password for user session: {}", session.getAttribute("IsExpiredPasswordCode"));

        String jsonData = createJsonRequestExpChangePassword(staffRequest, session);
        String url = baseUrl + "/api/ChangeDefaultPassword";

        logger.debug("Sending expired password change request to {} with payload: {}", url, jsonData);

        String response = httpClientRest.postData(url, jsonData, username, password);
        logger.info("Expired password change response received.");
        return ResponseEntity.ok(response);
    }

    private String createJsonRequestChangePassword(StaffRequest staffRequest, HttpSession session) {
        try {
            String staffID = (String) session.getAttribute("IsChangePasswordCode");
            logger.debug("Creating JSON request for password change: user ID = {}", staffID);

            JSONObject jsonObject = new JSONObject();
            jsonObject.put("id_card", staffID);
            jsonObject.put("password", staffRequest.getPassword());
            return jsonObject.toString();
        } catch (JSONException e) {
            logger.error("Error creating JSON request for password change: ", e);
            return "{}";
        }
    }

    private String createJsonRequestExpChangePassword(StaffRequest staffRequest, HttpSession session) {
        try {
            String staffID = (String) session.getAttribute("IsExpiredPasswordCode");
            logger.debug("Creating JSON request for expired password change: user ID = {}", staffID);

            JSONObject jsonObject = new JSONObject();
            jsonObject.put("id_card", staffID);
            jsonObject.put("password", staffRequest.getPassword());
            return jsonObject.toString();
        } catch (JSONException e) {
            logger.error("Error creating JSON request for expired password change: ", e);
            return "{}";
        }
    }

    private String createJsonRequestLogin(StaffRequest staffRequest) {
        try {
            logger.debug("Creating JSON request for login: user ID = {}", staffRequest.getIdCard());

            JSONObject jsonObject = new JSONObject();
            jsonObject.put("id_card", staffRequest.getIdCard());
            jsonObject.put("password", staffRequest.getPassword());
            return jsonObject.toString();
        } catch (JSONException e) {
            logger.error("Error creating JSON request for login: ", e);
            return "{}";
        }
    }
}
