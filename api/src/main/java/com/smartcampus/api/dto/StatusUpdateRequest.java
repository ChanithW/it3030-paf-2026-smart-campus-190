package com.smartcampus.api.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class StatusUpdateRequest {

    @NotBlank(message = "Status is required")
    private String status;

    private String reason;
    private String resolutionNotes;
    private String assignedToId;
}