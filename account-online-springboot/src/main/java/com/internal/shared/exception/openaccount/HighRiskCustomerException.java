package com.internal.shared.exception.openaccount;

import com.internal.shared.constant.AppConstants;
import lombok.Getter;

@Getter
public class HighRiskCustomerException extends RuntimeException {
    private final String rating;
    
    public HighRiskCustomerException(String rating) {
        super(AppConstants.AML_NEED_REVIEW_MSG);
        this.rating = rating;
    }
}

