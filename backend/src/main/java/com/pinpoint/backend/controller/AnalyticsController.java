package com.pinpoint.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pinpoint.backend.dto.AnalyticsOverviewResponse;
import com.pinpoint.backend.dto.FocusSessionRequest;
import com.pinpoint.backend.dto.FocusSessionResponse;
import com.pinpoint.backend.service.AnalyticsService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/analytics")
@Validated
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewResponse> getOverview() {
        return ResponseEntity.ok(analyticsService.getOverview());
    }

    @PostMapping("/focus-sessions")
    public ResponseEntity<FocusSessionResponse> logFocusSession(@Valid @RequestBody FocusSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(analyticsService.logFocusSession(request));
    }
}
