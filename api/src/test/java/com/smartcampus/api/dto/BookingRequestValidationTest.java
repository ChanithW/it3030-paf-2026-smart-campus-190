package com.smartcampus.api.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.ConstraintViolation;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class BookingRequestValidationTest {

    @Test
    void endTimeMustBeAfterStartTime() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            Validator validator = factory.getValidator();

            BookingRequest req = new BookingRequest();
            req.setResourceId("R-1");
            req.setPurpose("Study session");

            LocalDateTime start = LocalDateTime.now().plusDays(1);
            req.setStartTime(start);
            req.setEndTime(start.minusMinutes(30)); // invalid: end before start

            Set<ConstraintViolation<BookingRequest>> violations = validator.validate(req);

            assertThat(violations)
                    .anyMatch(v -> "End time must be after start time".equals(v.getMessage()));
        }
    }

    @Test
    void endTimeAfterStartTimeIsValid() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            Validator validator = factory.getValidator();

            BookingRequest req = new BookingRequest();
            req.setResourceId("R-1");
            req.setPurpose("Study session");

            LocalDateTime start = LocalDateTime.now().plusDays(1);
            req.setStartTime(start);
            req.setEndTime(start.plusMinutes(30));

            Set<ConstraintViolation<BookingRequest>> violations = validator.validate(req);

            assertThat(violations)
                    .noneMatch(v -> "End time must be after start time".equals(v.getMessage()));
        }
    }
}

