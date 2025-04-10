package com.cambodiapostbank.accountonline.cpbank.controller;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.LocaleResolver;

import javax.servlet.http.HttpServletRequest;
import java.util.Locale;
import java.util.Map;

@Controller
public class LanguageController {

    private final LocaleResolver localeResolver;
    private final Log logger = LogFactory.getLog(LanguageController.class);

    // Inject LocaleResolver from Spring context
    public LanguageController(LocaleResolver localeResolver) {
        this.localeResolver = localeResolver;
    }

    @PostMapping("/api/change-language")
    @ResponseBody
    public ResponseEntity<?> changeLanguage(@RequestBody Map<String, String> request, HttpServletRequest httpServletRequest) {
        String lang = request.get("lang");
        logger.info("Received language change request: " + lang);

        if (lang == null || lang.isEmpty()) {
            logger.warn("Invalid language request received.");
            return ResponseEntity.badRequest().body("Invalid language parameter.");
        }

        // Create a new Locale object based on the language parameter
        Locale locale = new Locale(lang);

        // Set the locale on the LocaleResolver for the session
        localeResolver.setLocale(httpServletRequest, null, locale);
        logger.info("Language changed successfully to: " + locale);

        return ResponseEntity.ok().body("Language changed successfully to " + lang);
    }
}