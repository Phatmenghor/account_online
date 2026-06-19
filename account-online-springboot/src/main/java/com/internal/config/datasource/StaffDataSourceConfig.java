package com.internal.config.datasource;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Slf4j
@Configuration
@EnableConfigurationProperties
public class StaffDataSourceConfig {

    // ==================== Staff (HR/SQL Server) Database Configuration ====================

    @Bean(name = "staffHikariConfig")
    @ConfigurationProperties(prefix = "mssql.staff.datasource")
    public HikariConfig staffHikariConfig() {
        return new HikariConfig();
    }

    @Bean(name = "staffDataSource")
    public DataSource staffDataSource(@Qualifier("staffHikariConfig") HikariConfig config) {
        if (config.getJdbcUrl() == null || config.getJdbcUrl().isEmpty()) {
            log.error("Staff SQL Server JDBC URL is NULL or EMPTY!");
            log.error("Check your application.yaml - mssql.staff.datasource.jdbc-url");
            throw new IllegalStateException("Staff SQL Server JDBC URL not configured!");
        }

        log.info("✔ Creating Staff SQL Server DataSource");
        log.info("   URL: {}", config.getJdbcUrl());
        log.info("   Username: {}", config.getUsername());
        log.info("   Driver: {}", config.getDriverClassName());
        log.info("   Pool: {}", config.getPoolName());

        try {
            return new HikariDataSource(config);
        } catch (Exception e) {
            log.warn("⚠ Failed to initialize Staff datasource: {}", e.getMessage());
            log.warn("Application will continue without Staff database connection. Please check database connectivity.");
            return new org.springframework.jdbc.datasource.SimpleDriverDataSource();
        }
    }

    @Bean(name = "staffJdbcTemplate")
    public JdbcTemplate staffJdbcTemplate(@Qualifier("staffDataSource") DataSource dataSource) {
        log.info("✔ Staff SQL Server JdbcTemplate created");
        return new JdbcTemplate(dataSource);
    }
}
