package com.pinpoint.backend.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StudyQueueItemResponse {

    private Long id;
    private Integer position;
    private LocalDateTime createdAt;
    private SavedContentResponse content;
}
