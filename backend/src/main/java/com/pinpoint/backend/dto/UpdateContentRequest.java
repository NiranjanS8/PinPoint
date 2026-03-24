package com.pinpoint.backend.dto;

import com.pinpoint.backend.entity.LearningStatus;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
}
