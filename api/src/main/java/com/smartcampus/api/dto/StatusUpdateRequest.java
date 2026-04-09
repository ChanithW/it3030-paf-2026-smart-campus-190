package com.smartcampus.api.dto;

import lombok.Data;

@Data
public class StatusUpdateRequest {
    private String status;
    private String reason;
    private String resolutionNotes;
    private String assignedToId;
}