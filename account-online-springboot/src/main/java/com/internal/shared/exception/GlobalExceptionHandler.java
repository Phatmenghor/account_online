package com.internal.shared.exception;

import com.internal.shared.exception.custom.BadRequestException;
import com.internal.shared.exception.custom.DuplicateNameException;
import com.internal.shared.exception.custom.InvalidInputException;
import com.internal.shared.exception.custom.MasterDataServiceException;
import com.internal.shared.exception.custom.NidValidationException;
import com.internal.shared.exception.custom.NotFoundException;
import com.internal.shared.exception.custom.UnauthorizedException;
import com.internal.shared.exception.custom.ValidateServiceException;
import com.internal.shared.exception.openaccount.AccountCreationException;
import com.internal.shared.exception.openaccount.AccountExistsException;
import com.internal.shared.exception.openaccount.DatabaseConnectionException;
import com.internal.shared.exception.openaccount.HighRiskCustomerException;
import com.internal.shared.exception.openaccount.OpenAccountException;
import com.internal.shared.exception.openaccount.T24ServiceException;
import com.internal.shared.exception.otp.OtpAttemptsExceededException;
import com.internal.shared.exception.otp.OtpCooldownException;
import com.internal.shared.exception.otp.OtpInvalidException;
import com.internal.shared.exception.otp.OtpNotFoundException;
import com.internal.shared.response.ApiResponse;
import com.internal.shared.constant.AppConstants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.multipart.MultipartException;

import javax.validation.ConstraintViolationException;
import java.io.EOFException;
import java.net.SocketTimeoutException;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(NidValidationException.class)
    public ResponseEntity<ApiResponse<Object>> handleNidValidationException(NidValidationException ex) {
        log.error("NID Validation failed - Status: {}, Message: {}", ex.getStatusCode(), ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotFoundException(NotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(MasterDataServiceException.class)
    public ResponseEntity<ApiResponse<Object>> handleMasterDataException(MasterDataServiceException ex) {
        log.error("Master data exception: {}", ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
    }

    @ExceptionHandler(AccountCreationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccountCreationException(AccountCreationException ex) {
        log.warn("Account creation failed: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ValidateServiceException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidateServiceException(ValidateServiceException ex) {
        log.error("ValidateServiceException: {}", ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
    }

    @ExceptionHandler(DuplicateNameException.class)
    public ResponseEntity<ApiResponse<Object>> handleDuplicateNameException(DuplicateNameException ex) {
        log.warn("Duplicate resource: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Object>> handleUnauthorizedException(UnauthorizedException ex) {
        log.warn("Unauthorized access: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadRequestException(BadRequestException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<ApiResponse<Object>> handleInvalidInputException(InvalidInputException ex) {
        log.warn("Invalid input: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        String errorMessage = errors.entrySet().stream()
                .map(entry -> entry.getKey() + ": " + entry.getValue())
                .collect(Collectors.joining(", "));

        log.warn("Validation errors: {}", errorMessage);
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Validation error: " + errorMessage, errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolationException(ConstraintViolationException ex) {
        String errorMessage = ex.getConstraintViolations().stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .collect(Collectors.joining(", "));

        log.warn("Constraint violation: {}", errorMessage);
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Validation error: " + errorMessage);
    }

    @ExceptionHandler(SQLException.class)
    public ResponseEntity<ApiResponse<Object>> handleSQLException(SQLException ex) {
        log.error("Database error - Code: {}, State: {}, Message: {}",
                ex.getErrorCode(), ex.getSQLState(), ex.getMessage());
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Database error occurred");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Data integrity violation: {}", ex.getMessage());
        String message = ex.getMessage().contains("unique") || ex.getMessage().contains("duplicate")
                ? "Resource already exists"
                : "Data integrity violation";
        return buildErrorResponse(HttpStatus.CONFLICT, message);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentialsException(BadCredentialsException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler({ResourceAccessException.class, SocketTimeoutException.class, TimeoutException.class, EOFException.class})
    public ResponseEntity<ApiResponse<Object>> handleTimeoutException(Exception ex) {
        log.warn("Timeout/Connection error: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.REQUEST_TIMEOUT, AppConstants.MSG_CONNECTION_TIMEOUT);
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ApiResponse<Object>> handleMultipartException(MultipartException ex) {
        log.warn("File upload interrupted: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.REQUEST_TIMEOUT, AppConstants.MSG_CONNECTION_TIMEOUT);
    }

    @ExceptionHandler(OpenAccountException.class)
    public ResponseEntity<ApiResponse<Object>> handleOpenAccountException(OpenAccountException ex) {
        String logLevel = "INVALID_DATE".equals(ex.getErrorCode()) ? "INFO" : "WARN";
        log.warn("Open account error [{}]: {} [{}]", ex.getErrorCode(), ex.getMessage(), logLevel);

        Map<String, Object> details = new HashMap<>();
        details.put("errorCode", ex.getErrorCode());
        details.put("timestamp", LocalDateTime.now().toString());
        if (ex.getData() != null) {
            details.putAll(ex.getData());
        }
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), details);
    }

    @ExceptionHandler(DatabaseConnectionException.class)
    public ResponseEntity<ApiResponse<Object>> handleDatabaseConnectionException(DatabaseConnectionException ex) {
        log.error("Database connection error: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_GATEWAY, AppConstants.MSG_DB_CONNECTION_ERR);
    }

    @ExceptionHandler(HighRiskCustomerException.class)
    public ResponseEntity<ApiResponse<Object>> handleHighRiskCustomerException(HighRiskCustomerException ex) {
        log.warn("High-risk customer detected: Rating {}", ex.getRating());
        Map<String, Object> details = new HashMap<>();
        details.put("rating", ex.getRating());
        return buildErrorResponse(HttpStatus.FORBIDDEN, AppConstants.MSG_HIGH_RISK_ERR, details);
    }

    @ExceptionHandler(AccountExistsException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccountExistsException(AccountExistsException ex) {
        log.warn("Account already exists for CIF: {}", ex.getCif());
        Map<String, Object> details = new HashMap<>();
        details.put("cif", ex.getCif());
        return buildErrorResponse(HttpStatus.CONFLICT, AppConstants.MSG_ACCOUNT_EXISTS_ERR, details);
    }

    @ExceptionHandler(T24ServiceException.class)
    public ResponseEntity<ApiResponse<Object>> handleT24ServiceException(T24ServiceException ex) {
        log.error("T24 service error: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_GATEWAY, AppConstants.MSG_GENERIC_ERROR);
    }

    // OTP Exceptions
    @ExceptionHandler(OtpInvalidException.class)
    public ResponseEntity<ApiResponse<Object>> handleOtpInvalidException(OtpInvalidException ex) {
        log.warn("Invalid OTP - Message: {}", ex.getMessage());
        String msg = String.format("Invalid OTP code. You have %d attempt%s remaining.",
                ex.getRemainingAttempts(),
                ex.getRemainingAttempts() == 1 ? "" : "s");
        return buildErrorResponse(HttpStatus.BAD_REQUEST, msg);
    }

    @ExceptionHandler(OtpAttemptsExceededException.class)
    public ResponseEntity<ApiResponse<Object>> handleOtpAttemptsExceededException(OtpAttemptsExceededException ex) {
        log.warn("OTP attempts exceeded - Message: {}", ex.getMessage());
        long remainingSeconds = ex.getLockoutMinutes();
        long minutes = remainingSeconds / 60;
        long seconds = remainingSeconds % 60;

        String timeMessage;
        if (minutes > 0 && seconds > 0) {
            timeMessage = String.format("%d minute%s and %d second%s",
                    minutes, minutes == 1 ? "" : "s",
                    seconds, seconds == 1 ? "" : "s");
        } else if (minutes > 0) {
            timeMessage = String.format("%d minute%s", minutes, minutes == 1 ? "" : "s");
        } else {
            timeMessage = String.format("%d second%s", seconds, seconds == 1 ? "" : "s");
        }

        String msg = String.format("Too many failed attempts. Please try again in %s.", timeMessage);
        return buildErrorResponse(HttpStatus.TOO_MANY_REQUESTS, msg);
    }

    @ExceptionHandler(OtpCooldownException.class)
    public ResponseEntity<ApiResponse<Object>> handleOtpCooldownException(OtpCooldownException ex) {
        log.warn("OTP cooldown active - Message: {}", ex.getMessage());
        int remainingSeconds = ex.getRemainingSeconds();
        String msg = String.format("Please wait %d second%s before requesting a new OTP.",
                remainingSeconds, remainingSeconds == 1 ? "" : "s");
        return buildErrorResponse(HttpStatus.TOO_MANY_REQUESTS, msg);
    }

    @ExceptionHandler(OtpNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleOtpNotFoundException(OtpNotFoundException ex) {
        log.warn("OTP not found - Message: {}", ex.getMessage());
        Map<String, Object> details = new HashMap<>();
        details.put("userMessage", "No verification code was found for this phone number. Please request a new one.");
        return buildErrorResponse(HttpStatus.NOT_FOUND, "No active OTP found. Please request a new OTP.", details);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleAllExceptions(Exception ex) {
        Throwable cause = ex;
        while (cause != null) {
            if (cause instanceof AccountCreationException) {
                String msg = cause.getMessage();
                log.error("Account creation exception propagated: {}", msg, ex);
                return buildErrorResponse(HttpStatus.BAD_REQUEST, msg);
            }
            cause = cause.getCause();
        }

        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.MSG_GENERIC_ERROR);
    }

    private ResponseEntity<ApiResponse<Object>> buildErrorResponse(HttpStatus status, String message) {
        return buildErrorResponse(status, message, null);
    }

    private ResponseEntity<ApiResponse<Object>> buildErrorResponse(HttpStatus status, String message, Object details) {
        ApiResponse<Object> response = ApiResponse.builder()
                .status("error")
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .code(status.value())
                .details(details)
                .build();
        return new ResponseEntity<>(response, status);
    }
}

