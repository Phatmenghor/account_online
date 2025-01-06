package com.cambodiapostbank.accountonline.cpbank.controller;

import com.cambodiapostbank.accountonline.cpbank.utils.http.HttpClientRest;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.net.URISyntaxException;

@Controller
@RequestMapping("/")
public class HomeController {

    private final Log logger = LogFactory.getLog(HomeController.class);

    HttpClientRest httpClientRest = new HttpClientRest();

    @Value("${t24api.base_url}")
    String BaseUrl;

    @Value("${t24api.username}")
    String USERNAME;

    @Value("${t24api.password}")
    String PASSWORD;


    @GetMapping("/")
    public String index() {
        return "redirect:/home";
    }

    @GetMapping("/home")
    public String homePage() {
        return "home";
    }

    @GetMapping("/maintenanceOpenByStaff")
    public String maintenanceOpenByStaff() {
        System.out.println("Hello");
        try {
            String JSON_DATA = "{\"systemCode\": \"OAOSTAFF\"}"; // Corrected JSON format
            String URL = BaseUrl + "/api/Maintenance";
            String response = httpClientRest.postData(URL, JSON_DATA, USERNAME, PASSWORD);

            JSONObject jsonObject = new JSONObject(response);
            int errorCode = jsonObject.getInt("ErrCode");
            String errorMsg = jsonObject.getString("ErrMsg");
            logger.info("errorCode: " + errorCode);
            logger.info("errorMsg: " + errorMsg);

            if (errorCode == 0) {
                return "maintenance";
            } else {
                return "redirect:/register-by-staff";
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage());
            return "StaffRegister";
        }
    }

    @GetMapping("/maintenanceOpenByCustomer")
    public String maintenanceOpenByCustomer() {
        System.out.println("Hello");
        try {
            String JSON_DATA = "{\"systemCode\": \"OAOCUS\"}"; // Corrected JSON format
            String URL = BaseUrl + "/api/Maintenance";
            String response = httpClientRest.postData(URL, JSON_DATA, USERNAME, PASSWORD);

            JSONObject jsonObject = new JSONObject(response);
            int errorCode = jsonObject.getInt("ErrCode");
            String errorMsg = jsonObject.getString("ErrMsg");
            logger.info("errorCode: " + errorCode);
            logger.info("errorMsg: " + errorMsg);

            if (errorCode == 0) {
                return "maintenance";
            } else {
                return "redirect:/register-by-customer";
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage());
            return "CustomerRegister";
        }
    }


    @GetMapping("/register-by-customer")
    public String ShowCustomerPage() {
        try {
            String JSON_DATA = "{\"systemCode\": \"OAOCUS\"}"; // Corrected JSON format
            String URL = BaseUrl + "/api/Maintenance";
            String response = httpClientRest.postData(URL, JSON_DATA, USERNAME, PASSWORD);

            JSONObject jsonObject = new JSONObject(response);
            int errorCode = jsonObject.getInt("ErrCode");
            String errorMsg = jsonObject.getString("ErrMsg");
            logger.info("errorCode: " + errorCode);
            logger.info("errorMsg: " + errorMsg);
            if (errorCode == 0) {
                return "redirect:/maintenanceOpenByCustomer";
            } else {
                return "CustomerRegister";
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage());
            return "CustomerRegister";
        }
    }

    @GetMapping("/register-by-staff")
    public String showRegisterForm(Model model, HttpSession session) throws URISyntaxException, IOException, InterruptedException {
        String IsLoginCode = (String) session.getAttribute("IsLoginCode");
        // Check if user is logged in
        if (IsLoginCode == null) {
            return "redirect:/login-page"; // Redirect to login page if not logged in
        } else {
            try {
                String JSON_DATA = "{\"systemCode\": \"OAOSTAFF\"}"; // Corrected JSON format
                String URL = BaseUrl + "/api/Maintenance";
                String response = httpClientRest.postData(URL, JSON_DATA, USERNAME, PASSWORD);

                JSONObject jsonObject = new JSONObject(response);
                int errorCode = jsonObject.getInt("ErrCode");
                String errorMsg = jsonObject.getString("ErrMsg");
                logger.info("errorCode: " + errorCode);
                logger.info("errorMsg: " + errorMsg);
                if (errorCode == 0) {
                    return "redirect:/maintenanceOpenByStaff";
                } else {
                    return "StaffRegister";
                }
            } catch (Exception ex) {
                System.out.println(ex.getMessage());
                // Handle exceptions appropriately and return error response
                return "StaffRegister";
            }
        }
    }

    @GetMapping("/sign-out")
    public String logout(HttpSession session) {
        // Invalidate the session
        session.invalidate();
        return "redirect:/home";
    }

    @GetMapping("/login-page")
    public String showLoginPage() {
        return "LoginPage";
    }

    @GetMapping("/change-password")
    public String showFormChangePassword(HttpSession session) {
        String IsChangePasswordCode = (String) session.getAttribute("IsChangePasswordCode");
        if (IsChangePasswordCode == null) {
            return "redirect:/login-page";
        } else {
            return "ChangeDefaultPassword";
        }
    }

    @GetMapping("/expired-password")
    public String showExpiredPassword(HttpSession session) {
        String IsExpiredPasswordCode = (String) session.getAttribute("IsExpiredPasswordCode");
        if (IsExpiredPasswordCode == null) {
            return "redirect:/login-page";
        } else {
            return "ChangePassExpired";
        }
    }
}
