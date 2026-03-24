package com.pinpoint.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AnalyticsDayResponse {
    private String date;
    private int minutes;
    private int intensity;
}
