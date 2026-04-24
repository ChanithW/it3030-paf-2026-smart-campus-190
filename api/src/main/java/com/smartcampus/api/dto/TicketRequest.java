package com.smartcampus.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class TicketRequest {

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Priority is required")
    @Pattern(regexp = "LOW|MEDIUM|HIGH|CRITICAL", message = "Priority must be LOW, MEDIUM, HIGH or CRITICAL")
    private String priority;

    private String location;

    @NotBlank(message = "Contact details are required")
    @Pattern(
        regexp = "^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6})|(0[0-9]{9})$",
        message = "Please provide a valid email address or 10-digit phone number starting with 0"
    )
    private String contactDetails;
}
