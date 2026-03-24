package com.pinpoint.backend.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FocusSessionResponse {
    private Long id;
    private int durationMinutes;
    private LocalDateTime completedAt;
}
