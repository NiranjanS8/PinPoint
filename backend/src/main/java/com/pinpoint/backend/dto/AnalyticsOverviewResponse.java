package com.pinpoint.backend.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AnalyticsOverviewResponse {
    private int totalFocusMinutes;
    private int currentStreakDays;
    private int longestStreakDays;
    private List<AnalyticsDayResponse> contributionDays;
    private List<TopicHeatmapItemResponse> topicHeatmap;
}
