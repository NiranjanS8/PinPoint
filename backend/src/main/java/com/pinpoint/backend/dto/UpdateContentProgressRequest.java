package com.pinpoint.backend.dto;

import com.pinpoint.backend.entity.LearningStatus;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateContentProgressRequest {

    private LearningStatus status;

    @Min(value = 0, message = "Progress percent must be between 0 and 100")
    @Max(value = 100, message = "Progress percent must be between 0 and 100")
    private Integer progressPercent;

    @Min(value = 0, message = "Playback position must be zero or greater")
    private Integer lastPlaybackSeconds;
}
