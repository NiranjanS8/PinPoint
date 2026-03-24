package com.pinpoint.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateStudyGoalRequest {

    @Size(max = 255, message = "Goal title must be 255 characters or fewer")
    private String title;

    @FutureOrPresent(message = "Target date must be today or later")
    private LocalDate targetDate;

    private Long contentId;

    private Boolean completed;
}
