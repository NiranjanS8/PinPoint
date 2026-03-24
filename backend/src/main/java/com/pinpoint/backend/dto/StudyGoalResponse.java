package com.pinpoint.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StudyGoalResponse {
    private Long id;
    private String title;
    private LocalDate targetDate;
    private Long contentId;
    private String contentTitle;
    private boolean completed;
    private long daysRemaining;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
