package com.cambodiapostbank.accountonline.cpbank.controller;

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