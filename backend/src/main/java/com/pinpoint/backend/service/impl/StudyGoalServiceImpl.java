package com.pinpoint.backend.service.impl;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pinpoint.backend.dto.StudyGoalRequest;
import com.pinpoint.backend.dto.StudyGoalResponse;
import com.pinpoint.backend.dto.UpdateStudyGoalRequest;
import com.pinpoint.backend.entity.SavedContent;
import com.pinpoint.backend.entity.StudyGoal;
import com.pinpoint.backend.exception.ContentNotFoundException;
import com.pinpoint.backend.exception.StudyGoalNotFoundException;
import com.pinpoint.backend.repository.SavedContentRepository;
import com.pinpoint.backend.repository.StudyGoalRepository;
import com.pinpoint.backend.service.StudyGoalService;

@Service
@Transactional
public class StudyGoalServiceImpl implements StudyGoalService {

    private final StudyGoalRepository studyGoalRepository;
    private final SavedContentRepository savedContentRepository;

    public StudyGoalServiceImpl(
            StudyGoalRepository studyGoalRepository,
            SavedContentRepository savedContentRepository
    ) {
        this.studyGoalRepository = studyGoalRepository;
        this.savedContentRepository = savedContentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudyGoalResponse> getGoals() {
        return studyGoalRepository.findAllByOrderByCompletedAscTargetDateAscCreatedAtAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public StudyGoalResponse createGoal(StudyGoalRequest request) {
        SavedContent content = resolveContent(request.getContentId());
        StudyGoal goal = studyGoalRepository.save(StudyGoal.builder()
                .title(request.getTitle().trim())
                .targetDate(request.getTargetDate())
                .contentId(content != null ? content.getId() : null)
                .completed(false)
                .build());
        return toResponse(goal);
    }

    @Override
    public StudyGoalResponse updateGoal(Long id, UpdateStudyGoalRequest request) {
        StudyGoal goal = findGoal(id);

        if (request.getTitle() != null) {
            goal.setTitle(request.getTitle().trim());
        }
        if (request.getTargetDate() != null) {
            goal.setTargetDate(request.getTargetDate());
        }
        if (request.getContentId() != null) {
            goal.setContentId(resolveContent(request.getContentId()).getId());
        }
        if (request.getCompleted() != null) {
            goal.setCompleted(request.getCompleted());
        }

        return toResponse(studyGoalRepository.save(goal));
    }

    @Override
    public void deleteGoal(Long id) {
        studyGoalRepository.delete(findGoal(id));
    }

    private StudyGoal findGoal(Long id) {
        return studyGoalRepository.findById(id)
                .orElseThrow(() -> new StudyGoalNotFoundException("Goal not found for id " + id));
    }

    private SavedContent resolveContent(Long contentId) {
        if (contentId == null) {
            return null;
        }
        return savedContentRepository.findById(contentId)
                .orElseThrow(() -> new ContentNotFoundException("Content not found for id " + contentId));
    }

    private StudyGoalResponse toResponse(StudyGoal goal) {
        SavedContent content = goal.getContentId() != null ? resolveContent(goal.getContentId()) : null;
        return StudyGoalResponse.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .targetDate(goal.getTargetDate())
                .contentId(goal.getContentId())
                .contentTitle(content != null ? content.getTitle() : null)
                .completed(goal.isCompleted())
                .daysRemaining(Math.max(0, ChronoUnit.DAYS.between(LocalDate.now(), goal.getTargetDate())))
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}
