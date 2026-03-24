package com.pinpoint.backend.dto;

import com.pinpoint.backend.entity.LearningStatus;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateContentRequest {

    private LearningStatus status;

    @Min(value = 0, message = "Progress percent must be between 0 and 100")
    @Max(value = 100, message = "Progress percent must be between 0 and 100")
    private Integer progressPercent;

    @Size(max = 5000, message = "Notes must be 5000 characters or fewer")
    private String notes;

    @Size(max = 1000, message = "Tags must be 1000 characters or fewer")
    @Pattern(
            regexp = "^[a-zA-Z0-9,\\-\\s]*$",
            message = "Tags may only contain letters, numbers, spaces, commas, and hyphens"
    )
    private String tags;
}
