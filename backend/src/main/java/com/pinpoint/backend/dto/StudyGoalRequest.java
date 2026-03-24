package com.pinpoint.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudyGoalRequest {

    @NotBlank(message = "Goal title is required")
    @Size(max = 255, message = "Goal title must be 255 characters or fewer")
    private String title;

    @NotNull(message = "Target date is required")
    @FutureOrPresent(message = "Target date must be today or later")
    private LocalDate targetDate;

    private Long contentId;
}
