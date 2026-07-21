package com.internal.shared.exception.openaccount;

import com.internal.shared.constant.AppConstants;
import lombok.Getter;

@Getter
public class AccountExistsException extends RuntimeException {
    private final String cif;
    
    public AccountExistsException(String cif) {
        super(AppConstants.MSG_ACCOUNT_EXISTS_ERR);
        this.cif = cif;
    }
}

