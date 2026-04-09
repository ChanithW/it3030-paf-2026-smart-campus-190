package com.smartcampus.api.dto;

import com.smartcampus.api.enums.ResourceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResourceRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Type is required")
    private String type;

    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String availabilityWindows;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    private String description;
}
