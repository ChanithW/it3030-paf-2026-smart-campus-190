package com.smartcampus.api.dto;

import com.smartcampus.api.enums.ResourceStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ResourceRequest {

    @NotBlank(message = "Name is required")
    @Pattern(regexp = "^[A-Za-z0-9 ]+$", message = "Name can only contain letters, numbers, and spaces")
    private String name;

    @NotBlank(message = "Type is required")
    private String type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String availabilityWindows;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    private String description;
}
