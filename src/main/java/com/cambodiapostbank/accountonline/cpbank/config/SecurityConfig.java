// SOLUTION 1: Update SecurityConfig.java to add secure cookie configuration

package com.cambodiapostbank.accountonline.cpbank.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String[] PERMIT_ALL_URLS = {
            "/",
            "/change-language/**",
            "/assets/**",
            "/register/**",
            "/api/**",
            "/home/**",
            "/register-by-customer/**",
            "/register-by-staff/**",
            "/sign-out/**",
            "/login-page/**",
            "/change-password/**",
            "/expired-password/**",
            "/maintenanceOpenByCustomer/**",
            "/maintenanceOpenByStaff/**",
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf().disable() // Disable CSRF protection
                .authorizeRequests()
                .antMatchers(PERMIT_ALL_URLS).permitAll()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .and()
                // ADD SECURE HEADERS (compatible with Spring Boot 2.7.x)
                .headers(headers -> headers
                        .frameOptions().deny()
                        .contentTypeOptions()
                        .and()
                        .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                                .maxAgeInSeconds(31536000)
                        )
                );
        return http.build();
    }
}