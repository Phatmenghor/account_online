package com.cambodiapostbank.accountonline.cpbank.controller;

<<<<<<< HEAD
import com.cambodiapostbank.accountonline.cpbank.utils.http.HttpClient;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.beans.factory.annotation.Value;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.net.URISyntaxException;
import org.apache.commons.logging.Log;
=======
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpSession;


@Controller
@RequestMapping("/")
public class HomeController {

    private final Log logger = LogFactory.getLog(HomeController.class);

    @Value("${t24api.base_url}")
    String BaseUrl;

    @Value("${t24api.username}")
    String USERNAME;

    @Value("${t24api.password}")
    String PASSWORD;


    @GetMapping("/")
    public String index() {
        logger.info("Redirecting to home page.");
        return "redirect:/register";
    }

    @GetMapping("/register")
    public String showCustomerPage() {
        logger.info("Rendering customer registration page.");
        return "pages/customer-register";
    }
}

