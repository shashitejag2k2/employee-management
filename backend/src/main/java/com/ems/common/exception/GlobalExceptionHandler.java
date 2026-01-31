package com.ems.common.exception;

import com.ems.common.config.CorrelationIdFilter;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.OffsetDateTime;
import java.util.List;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<ErrorDetail> details = ex.getBindingResult().getFieldErrors().stream()
                .map(this::toErrorDetail)
                .toList();

        ErrorResponse body = baseError(request, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Validation failed");
        body.setDetails(details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex, HttpServletRequest request) {
        ErrorResponse body = baseError(request, HttpStatus.NOT_FOUND, "NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex, HttpServletRequest request) {
        ErrorResponse body = baseError(request, HttpStatus.CONFLICT, "CONFLICT", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex, HttpServletRequest request) {
        ErrorResponse body = baseError(request, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleNotReadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        log.warn("Request body could not be parsed for {}: {}", request.getRequestURI(), ex.getMessage());

        String message = "Malformed JSON request";
        Throwable mostSpecific = ex.getMostSpecificCause();
        if (mostSpecific != null && mostSpecific.getMessage() != null && !mostSpecific.getMessage().isBlank()) {
            message = mostSpecific.getMessage();
        }

        ErrorResponse body = baseError(request, HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccess(DataAccessException ex, HttpServletRequest request) {
        log.error("Database error while handling request {}", request.getRequestURI(), ex);
        ErrorResponse body = baseError(request, HttpStatus.INTERNAL_SERVER_ERROR, "DATABASE_ERROR",
                "Database error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Unexpected error while handling request {}", request.getRequestURI(), ex);
        ErrorResponse body = baseError(request, HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Unexpected error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private ErrorDetail toErrorDetail(FieldError fe) {
        return new ErrorDetail(fe.getField(), fe.getDefaultMessage());
    }

    private ErrorResponse baseError(HttpServletRequest request, HttpStatus status, String code, String message) {
        ErrorResponse body = new ErrorResponse();
        body.setTimestamp(OffsetDateTime.now());
        body.setStatus(status.value());
        body.setError(status.getReasonPhrase());
        body.setCode(code);
        body.setMessage(message);
        body.setPath(request.getRequestURI());

        Object cid = request.getAttribute(CorrelationIdFilter.REQUEST_ATTRIBUTE);
        if (cid != null) {
            body.setCorrelationId(cid.toString());
        }

        return body;
    }
}
