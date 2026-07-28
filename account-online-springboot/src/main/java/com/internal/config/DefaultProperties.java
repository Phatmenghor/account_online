package com.internal.config;

import com.internal.shared.constant.AppConstants;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Spring configuration properties for default banking parameters (cpb.defaults).
 * Derives default fallback values directly from AppConstants.
 */
@Component
@ConfigurationProperties(prefix = "cpb.defaults")
@Data
public class DefaultProperties {

    private String branchCode = AppConstants.DEFAULT_BRANCH_CODE;
    private String sector = AppConstants.DEFAULT_SECTOR;
    private String costCenter = AppConstants.DEFAULT_COST_CENTER;
    private String industry = AppConstants.DEFAULT_INDUSTRY;
    private String target = AppConstants.DEFAULT_TARGET;
    private String language = AppConstants.DEFAULT_LANGUAGE;
    private String customerRating = AppConstants.DEFAULT_CUSTOMER_RATING;
    private String customerStatus = AppConstants.DEFAULT_CUSTOMER_STATUS;
    private String customerType = AppConstants.DEFAULT_CUSTOMER_TYPE;
    private String ownership = AppConstants.DEFAULT_OWNERSHIP;
    private String legalHolderName = AppConstants.DEFAULT_LEGAL_HOLDER_NAME;
    private String nationality = AppConstants.DEFAULT_NATIONALITY;
    private String productCode = AppConstants.PRODUCT_CODE;
    private String accountActivity = AppConstants.ACCOUNT_ACTIVITY;
    private String newArrangement = AppConstants.NEW_ARRANGEMENT;
}
