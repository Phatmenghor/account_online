package com.cambodiapostbank.accountonline.cpbank.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;

@Configuration
public class WebSecurityConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // SECURE RESOURCE HANDLING - Prevent directory listing
        registry.addResourceHandler("/assets/fonts/**")
                .addResourceLocations("classpath:/static/assets/fonts/")
                .setCachePeriod(31536000) // 1 year cache
                .resourceChain(true);

        registry.addResourceHandler("/assets/images/**")
                .addResourceLocations("classpath:/static/assets/images/")
                .setCachePeriod(31536000)
                .resourceChain(true);

        registry.addResourceHandler("/assets/css/**")
                .addResourceLocations("classpath:/static/assets/css/")
                .setCachePeriod(31536000)
                .resourceChain(true);

        registry.addResourceHandler("/assets/js/**")
                .addResourceLocations("classpath:/static/assets/js/")
                .setCachePeriod(31536000)
                .resourceChain(true);

        registry.addResourceHandler("/assets/libs/**")
                .addResourceLocations("classpath:/static/assets/libs/")
                .setCachePeriod(31536000)
                .resourceChain(true);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // BLOCK DIRECTORY ACCESS - Return 404 for directory requests
        registry.addViewController("/fonts/").setViewName("error/404");
        registry.addViewController("/images/").setViewName("error/404");
        registry.addViewController("/css/").setViewName("error/404");
        registry.addViewController("/js/").setViewName("error/404");
        registry.addViewController("/assets/").setViewName("error/404");
    }
}