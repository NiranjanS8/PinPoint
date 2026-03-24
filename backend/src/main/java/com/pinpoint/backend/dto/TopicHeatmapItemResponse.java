package com.pinpoint.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TopicHeatmapItemResponse {
    private String label;
    private int count;
    private int percentage;
}
