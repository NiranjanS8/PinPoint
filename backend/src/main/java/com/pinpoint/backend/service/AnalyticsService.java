package com.pinpoint.backend.service;

import com.pinpoint.backend.dto.AnalyticsOverviewResponse;
import com.pinpoint.backend.dto.FocusSessionRequest;
import com.pinpoint.backend.dto.FocusSessionResponse;

public interface AnalyticsService {

    AnalyticsOverviewResponse getOverview();

    FocusSessionResponse logFocusSession(FocusSessionRequest request);
}
