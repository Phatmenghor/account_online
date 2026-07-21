package com.internal.shared.component;

import org.springframework.stereotype.Component;

@Component
public class AccountComponent {

    /**
     * Formats the account number to mask all but the last 4 digits.
     */
    public String formatAccountNumber(String accountNo) {
        if (accountNo == null || accountNo.length() < 4) {
            return accountNo;
        }
        return "****" + accountNo.substring(accountNo.length() - 4);
    }
}
