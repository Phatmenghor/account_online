// SOLUTION 1: Add Security Configuration to prevent directory listing

package com.cambodiapostbank.accountonline.cpbank.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig implements WebMvcConfigurer {

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
        http.csrf().disable()
                .authorizeRequests()
                .antMatchers(PERMIT_ALL_URLS).permitAll()
                // BLOCK DIRECTORY ACCESS
                .antMatchers("/fonts/", "/images/", "/css/", "/js/").denyAll()
                .antMatchers("/fonts/**", "/images/**", "/css/**", "/js/**").permitAll()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .and()
                // ADD SECURE HEADERS
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

    // CONFIGURE RESOURCE HANDLING TO PREVENT DIRECTORY LISTING
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCachePeriod(3600)
                .resourceChain(true);
    }
}