package com.smartcampus.api.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequest {

    @NotBlank(message = "Resource ID is required")
    private String resourceId;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    private LocalDateTime endTime;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @Min(value = 1, message = "Expected attendees must be at least 1 if provided")
    private Integer expectedAttendees;

    @AssertTrue(message = "End time must be after start time")
    public boolean isEndTimeAfterStartTime() {
        if (startTime == null || endTime == null) return true;
        return endTime.isAfter(startTime);
    }
}