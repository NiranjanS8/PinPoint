package com.pinpoint.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FocusSessionRequest {

    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 720, message = "Duration must be 720 minutes or fewer")
    private Integer durationMinutes;
}
