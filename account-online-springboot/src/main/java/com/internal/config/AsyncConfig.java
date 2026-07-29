package com.internal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.Executor;

/**
 * Configuration for asynchronous processing and Web MVC Async request timeouts.
 * Increases async request timeout to 3 minutes (180,000 ms) to accommodate T24 SOAP operations.
 */
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer, WebMvcConfigurer {

    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
        // Set default async request timeout to 3 minutes (180,000 ms)
        configurer.setDefaultTimeout(180_000L);
    }

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-log-");
        executor.initialize();
        return executor;
    }
}
