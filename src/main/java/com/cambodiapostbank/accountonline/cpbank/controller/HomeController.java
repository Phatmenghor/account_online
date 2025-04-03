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
        return "redirect:/home";
    }

    @GetMapping("/home")
    public String homePage() {
        logger.info("Rendering home page.");
        return "pages/home";
    }

    @GetMapping("/register-by-customer")
    public String showCustomerPage() {
        logger.info("Rendering customer registration page.");
        return "pages/customer-register";
    }

    @GetMapping("/register-by-staff")
    public String showRegisterForm(HttpSession session) {
        if (session.getAttribute("IsLoginCode") == null) {
            logger.warn("Unauthorized access attempt to /register-by-staff. Redirecting to login page.");
            return "redirect:/login-page";
        }
        logger.info("Rendering staff registration page.");
        return "pages/staff-register";
    }

    @GetMapping("/sign-out")
    public String logout(HttpSession session) {
        logger.info("User signing out. Invalidating session.");
        session.invalidate();
        return "redirect:/home";
    }

    @GetMapping("/login-page")
    public String showLoginPage() {
        logger.info("Rendering login page.");
        return "pages/login-page";
    }

    @GetMapping("/change-password")
    public String showChangePasswordForm(HttpSession session) {
        if (session.getAttribute("IsChangePasswordCode") == null) {
            logger.warn("Unauthorized access attempt to /change-password. Redirecting to login page.");
            return "redirect:/login-page";
        }
        logger.info("Rendering change default password page.");
        return "pages/change-default-password";
    }

    @GetMapping("/expired-password")
    public String showExpiredPasswordForm(HttpSession session) {
        if (session.getAttribute("IsExpiredPasswordCode") == null) {
            logger.warn("Unauthorized access attempt to /expired-password. Redirecting to login page.");
            return "redirect:/login-page";
        }
        logger.info("Rendering change expired password page.");
        return "pages/change-expired-password";
    }
}