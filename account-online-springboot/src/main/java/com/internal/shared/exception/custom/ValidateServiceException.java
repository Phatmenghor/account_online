package com.internal.shared.exception.custom;

public class ValidateServiceException extends RuntimeException {
    public ValidateServiceException(String message) {
        super(message);
    }
    public ValidateServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
