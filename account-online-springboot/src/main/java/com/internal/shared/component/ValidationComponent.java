package com.internal.shared.component;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class ValidationComponent {

    private final Validator validator;

    /**
     * Programmatically validates an object and throws ConstraintViolationException if errors exist.
     */
    public <T> void validate(T object) {
        Set<ConstraintViolation<T>> violations = validator.validate(object);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
    }
}
