package com.pinpoint.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudyQueueRequest {

    @NotNull(message = "Content id is required")
    private Long contentId;
}
