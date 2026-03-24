package com.pinpoint.backend.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pinpoint.backend.dto.AnalyticsDayResponse;
import com.pinpoint.backend.dto.AnalyticsOverviewResponse;
import com.pinpoint.backend.dto.FocusSessionRequest;
import com.pinpoint.backend.dto.FocusSessionResponse;
import com.pinpoint.backend.dto.TopicHeatmapItemResponse;
import com.pinpoint.backend.entity.FocusSession;
import com.pinpoint.backend.entity.SavedContent;
import com.pinpoint.backend.repository.FocusSessionRepository;
import com.pinpoint.backend.repository.SavedContentRepository;
import com.pinpoint.backend.service.AnalyticsService;

@Service
@Transactional
public class AnalyticsServiceImpl implements AnalyticsService {

    private final FocusSessionRepository focusSessionRepository;
    private final SavedContentRepository savedContentRepository;

    public AnalyticsServiceImpl(
            FocusSessionRepository focusSessionRepository,
            SavedContentRepository savedContentRepository
    ) {
        this.focusSessionRepository = focusSessionRepository;
        this.savedContentRepository = savedContentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsOverviewResponse getOverview() {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(83);
        List<FocusSession> windowSessions = focusSessionRepository.findAllByCompletedAtBetweenOrderByCompletedAtAsc(
                startDate.atStartOfDay(),
                today.plusDays(1).atStartOfDay().minusNanos(1)
        );
        List<FocusSession> allSessions = focusSessionRepository.findAllByOrderByCompletedAtAsc();

        Map<LocalDate, Integer> minutesByDate = new LinkedHashMap<>();
        for (int index = 0; index < 84; index++) {
            minutesByDate.put(startDate.plusDays(index), 0);
        }
        for (FocusSession session : windowSessions) {
            LocalDate date = session.getCompletedAt().toLocalDate();
            minutesByDate.computeIfPresent(date, (key, current) -> current + session.getDurationMinutes());
        }

        int maxMinutes = minutesByDate.values().stream().mapToInt(Integer::intValue).max().orElse(0);
        List<AnalyticsDayResponse> contributionDays = minutesByDate.entrySet().stream()
                .map(entry -> AnalyticsDayResponse.builder()
                        .date(entry.getKey().toString())
                        .minutes(entry.getValue())
                        .intensity(toIntensity(entry.getValue(), maxMinutes))
                        .build())
                .toList();

        Map<LocalDate, Integer> allMinutesByDate = new LinkedHashMap<>();
        for (FocusSession session : allSessions) {
            LocalDate date = session.getCompletedAt().toLocalDate();
            allMinutesByDate.merge(date, session.getDurationMinutes(), Integer::sum);
        }

        return AnalyticsOverviewResponse.builder()
                .totalFocusMinutes(allSessions.stream().mapToInt(FocusSession::getDurationMinutes).sum())
                .currentStreakDays(calculateCurrentStreak(allMinutesByDate, today))
                .longestStreakDays(calculateLongestStreak(allMinutesByDate))
                .contributionDays(contributionDays)
                .topicHeatmap(buildTopicHeatmap(savedContentRepository.findAll()))
                .build();
    }

    @Override
    public FocusSessionResponse logFocusSession(FocusSessionRequest request) {
        FocusSession session = focusSessionRepository.save(FocusSession.builder()
                .durationMinutes(request.getDurationMinutes())
                .completedAt(LocalDateTime.now())
                .build());

        return FocusSessionResponse.builder()
                .id(session.getId())
                .durationMinutes(session.getDurationMinutes())
                .completedAt(session.getCompletedAt())
                .build();
    }

    private int toIntensity(int minutes, int maxMinutes) {
        if (minutes <= 0 || maxMinutes <= 0) {
            return 0;
        }
        double ratio = (double) minutes / maxMinutes;
        if (ratio < 0.25d) {
            return 1;
        }
        if (ratio < 0.5d) {
            return 2;
        }
        if (ratio < 0.75d) {
            return 3;
        }
        return 4;
    }

    private int calculateCurrentStreak(Map<LocalDate, Integer> minutesByDate, LocalDate today) {
        int streak = 0;
        LocalDate cursor = today;
        while (minutesByDate.getOrDefault(cursor, 0) > 0) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private int calculateLongestStreak(Map<LocalDate, Integer> minutesByDate) {
        int longest = 0;
        int current = 0;
        List<LocalDate> dates = new ArrayList<>(minutesByDate.keySet());
        dates.sort(Comparator.naturalOrder());

        for (LocalDate date : dates) {
            if (minutesByDate.getOrDefault(date, 0) > 0) {
                current++;
                longest = Math.max(longest, current);
            } else {
                current = 0;
            }
        }

        return longest;
    }

    private List<TopicHeatmapItemResponse> buildTopicHeatmap(List<SavedContent> contentItems) {
        Map<String, Integer> topicCounts = new LinkedHashMap<>();

        for (SavedContent content : contentItems) {
            Stream<String> tags = Stream.of((content.getTags() == null ? "" : content.getTags()).split(","))
                    .map(String::trim)
                    .filter(tag -> !tag.isBlank());
            Stream<String> folder = content.getFolder() != null
                    ? Stream.of(content.getFolder().getName())
                    : Stream.empty();

            Stream.concat(tags, folder)
                    .map(value -> value.toLowerCase(Locale.ROOT))
                    .forEach(value -> topicCounts.merge(value, 1, Integer::sum));
        }

        int total = topicCounts.values().stream().mapToInt(Integer::intValue).sum();
        if (total == 0) {
            return List.of();
        }

        return topicCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed().thenComparing(Map.Entry::getKey))
                .limit(8)
                .map(entry -> TopicHeatmapItemResponse.builder()
                        .label(entry.getKey())
                        .count(entry.getValue())
                        .percentage((int) Math.round((entry.getValue() * 100.0d) / total))
                        .build())
                .toList();
    }
}
