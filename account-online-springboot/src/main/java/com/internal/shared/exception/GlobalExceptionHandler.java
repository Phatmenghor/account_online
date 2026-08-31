package com.internal.shared.exception;

import com.internal.shared.constant.AppConstants;
import com.internal.shared.exception.custom.*;
import com.internal.shared.exception.openaccount.*;
import com.internal.shared.exception.otp.*;
import com.internal.shared.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.multipart.MultipartException;

import jakarta.validation.ConstraintViolationException;
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

    @ExceptionHandler(AccountExistsException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccountExistsException(AccountExistsException ex) {
        log.warn("[GlobalExceptionHandler] Account already exists. cif={}, error={}", ex.getCif(), ex.getMessage());
        Map<String, Object> details = new HashMap<>();
        if (ex.getCif() != null) {
            details.put("cif", ex.getCif());
        }
        String msg = (ex.getMessage() != null && !ex.getMessage().isBlank())
                ? ex.getMessage()
                : AppConstants.MSG_ACCOUNT_EXISTS_ERR;

        return buildErrorResponse(HttpStatus.CONFLICT, msg, details);
    }

    @ExceptionHandler(NidValidationException.class)
    public ResponseEntity<ApiResponse<Object>> handleNidValidationException(NidValidationException ex) {
        log.error("[GlobalExceptionHandler] NID Validation failed. statusCode={}, message={}", ex.getStatusCode(), ex.getMessage(), ex);
        String msg = (ex.getMessage() != null && !ex.getMessage().isBlank())
                ? ex.getMessage()
                : AppConstants.MSG_502;
        HttpStatus httpStatus = HttpStatus.resolve(ex.getStatusCode());
        if (httpStatus == null) {
            httpStatus = HttpStatus.BAD_GATEWAY;
        }
        return buildErrorResponse(httpStatus, msg);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotFoundException(NotFoundException ex) {
        log.warn("[GlobalExceptionHandler] Resource not found. message={}", ex.getMessage());
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(MasterDataServiceException.class)
    public ResponseEntity<ApiResponse<Object>> handleMasterDataException(MasterDataServiceException ex) {
        log.error("[GlobalExceptionHandler] Master data exception. message={}", ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.MSG_GENERIC_ERROR);
    }

    @ExceptionHandler(AccountCreationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccountCreationException(AccountCreationException ex) {
        log.warn("[GlobalExceptionHandler] Account creation failed. message={}", ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ValidateServiceException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidateServiceException(ValidateServiceException ex) {
        log.error("[GlobalExceptionHandler] ValidateServiceException occurred. message={}", ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.MSG_GENERIC_ERROR);
    }

    @ExceptionHandler(DuplicateNameException.class)
    public ResponseEntity<ApiResponse<Object>> handleDuplicateNameException(DuplicateNameException ex) {
        log.warn("[GlobalExceptionHandler] Duplicate resource. message={}", ex.getMessage());
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Object>> handleUnauthorizedException(UnauthorizedException ex) {
        log.warn("[GlobalExceptionHandler] Unauthorized access attempt. message={}", ex.getMessage());
        return buildErrorResponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadRequestException(BadRequestException ex) {
        log.warn("[GlobalExceptionHandler] Bad request. message={}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<ApiResponse<Object>> handleInvalidInputException(InvalidInputException ex) {
        log.warn("[GlobalExceptionHandler] Invalid input. message={}", ex.getMessage());
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

        log.warn("[GlobalExceptionHandler] DTO Validation failed. errors={}", errorMessage);
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "សូមពិនិត្យព័ត៌មានដែលបានបញ្ចូល: " + errorMessage, errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolationException(ConstraintViolationException ex) {
        String errorMessage = ex.getConstraintViolations().stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .collect(Collectors.joining(", "));

        log.warn("[GlobalExceptionHandler] Constraint violation. errors={}", errorMessage);
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "សូមពិនិត្យព័ត៌មានដែលបានបញ្ចូល: " + errorMessage);
    }

    @ExceptionHandler({SQLException.class, org.springframework.dao.DataAccessException.class})
    public ResponseEntity<ApiResponse<Object>> handleSQLException(Exception ex) {
        log.error("[GlobalExceptionHandler] Database error occurred. error={}", ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.MSG_DB_CONNECTION_ERR);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("[GlobalExceptionHandler] Data integrity violation. error={}", ex.getMessage(), ex);
        String message = ex.getMessage().contains("unique") || ex.getMessage().contains("duplicate")
                ? AppConstants.MSG_ACCOUNT_EXISTS_ERR
                : AppConstants.MSG_GENERIC_ERROR;
        return buildErrorResponse(HttpStatus.CONFLICT, message);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentialsException(BadCredentialsException ex) {
        log.warn("[GlobalExceptionHandler] Bad credentials authentication failure. message={}", ex.getMessage());
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "ឈ្មោះអ្នកប្រើប្រាស់ ឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវទេ។");
    }

    @ExceptionHandler({ResourceAccessException.class, SocketTimeoutException.class, TimeoutException.class, EOFException.class})
    public ResponseEntity<ApiResponse<Object>> handleTimeoutException(Exception ex) {
        log.error("[GlobalExceptionHandler] Connection/Timeout error. error={}", ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.GATEWAY_TIMEOUT, AppConstants.MSG_CONNECTION_TIMEOUT);
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ApiResponse<Object>> handleMultipartException(MultipartException ex) {
        log.warn("[GlobalExceptionHandler] File upload interrupted. error={}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, AppConstants.MSG_CONNECTION_TIMEOUT);
    }

    @ExceptionHandler(OpenAccountException.class)
    public ResponseEntity<ApiResponse<Object>> handleOpenAccountException(OpenAccountException ex) {
        log.warn("[GlobalExceptionHandler] Open account exception. errorCode={}, message={}", ex.getErrorCode(), ex.getMessage());
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
        log.error("[GlobalExceptionHandler] Database connection exception. error={}", ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.BAD_GATEWAY, AppConstants.MSG_DB_CONNECTION_ERR);
    }

    @ExceptionHandler(HighRiskCustomerException.class)
    public ResponseEntity<ApiResponse<Object>> handleHighRiskCustomerException(HighRiskCustomerException ex) {
        log.warn("[GlobalExceptionHandler] High-risk customer detected. rating={}", ex.getRating());
        Map<String, Object> details = new HashMap<>();
        details.put("rating", ex.getRating());
        return buildErrorResponse(HttpStatus.FORBIDDEN, AppConstants.MSG_HIGH_RISK_ERR, details);
    }

    @ExceptionHandler(T24ServiceException.class)
    public ResponseEntity<ApiResponse<Object>> handleT24ServiceException(T24ServiceException ex) {
        log.error("[GlobalExceptionHandler] T24 service error. error={}", ex.getMessage(), ex);
        String userMsg = AppConstants.MSG_GENERIC_ERROR;
        if (ex.getMessage() != null && ex.getMessage().contains("រួចហើយ")) {
            userMsg = AppConstants.MSG_ACCOUNT_EXISTS_ERR;
            return buildErrorResponse(HttpStatus.CONFLICT, userMsg);
        }
        return buildErrorResponse(HttpStatus.BAD_GATEWAY, userMsg);
    }

    // OTP Exceptions
    @ExceptionHandler(OtpInvalidException.class)
    public ResponseEntity<ApiResponse<Object>> handleOtpInvalidException(OtpInvalidException ex) {
        log.warn("[GlobalExceptionHandler] Invalid OTP attempt. message={}", ex.getMessage());
        String msg = String.format("លេខកូដ OTP មិនត្រឹមត្រូវទេ។ លោកអ្នកនៅសល់ %d ដងទៀត។", ex.getRemainingAttempts());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, msg);
    }

    @ExceptionHandler(OtpAttemptsExceededException.class)
    public ResponseEntity<ApiResponse<Object>> handleOtpAttemptsExceededException(OtpAttemptsExceededException ex) {
        log.warn("[GlobalExceptionHandler] OTP attempts exceeded limit. message={}", ex.getMessage());
        long remainingSeconds = ex.getLockoutMinutes();
        long minutes = remainingSeconds / 60;
        long seconds = remainingSeconds % 60;

        String timeMessage = minutes > 0 ? String.format("%d នាទី", minutes) : String.format("%d វិនាទី", seconds);
        String msg = String.format("លោកអ្នកបានបញ្ចូលលេខកូដខុសច្រើនដងពេកហើយ។ សូមព្យាយាមម្តងទៀតក្នុងរយៈពេល %s។", timeMessage);
        return buildErrorResponse(HttpStatus.TOO_MANY_REQUESTS, msg);
    }

    @ExceptionHandler(OtpCooldownException.class)
    public ResponseEntity<ApiResponse<Object>> handleOtpCooldownException(OtpCooldownException ex) {
        log.warn("[GlobalExceptionHandler] OTP cooldown active. message={}", ex.getMessage());
        String msg = String.format("សូមរង់ចាំ %d វិនាទី មុនពេលស្នើសុំលេខកូដ OTP ថ្មី។", ex.getRemainingSeconds());
        return buildErrorResponse(HttpStatus.TOO_MANY_REQUESTS, msg);
    }

    @ExceptionHandler(OtpNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleOtpNotFoundException(OtpNotFoundException ex) {
        log.warn("[GlobalExceptionHandler] OTP not found. message={}", ex.getMessage());
        return buildErrorResponse(HttpStatus.NOT_FOUND, "មិនស្គាល់លេខកូដ OTP នេះទេ។ សូមស្នើសុំលេខកូដ OTP ថ្មី។");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleAllExceptions(Exception ex) {
        Throwable cause = ex;
        while (cause != null) {
            if (cause instanceof AccountExistsException aee) {
                return handleAccountExistsException(aee);
            }
            if (cause instanceof AccountCreationException ace) {
                return handleAccountCreationException(ace);
            }
            cause = cause.getCause();
        }

        log.error("[GlobalExceptionHandler] Unhandled exception occurred. error={}", ex.getMessage(), ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, AppConstants.MSG_GENERIC_ERROR);
    }

    private ResponseEntity<ApiResponse<Object>> buildErrorResponse(HttpStatus status, String message) {
        return buildErrorResponse(status, message, null);
    }

    private ResponseEntity<ApiResponse<Object>> buildErrorResponse(HttpStatus status, String message, Object details) {
        if (message != null && !message.isBlank()) {
            org.slf4j.MDC.put("responseMessage", message);
        }
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
