package com.pinpoint.backend.service;

import java.util.List;

import com.pinpoint.backend.dto.StudyGoalRequest;
import com.pinpoint.backend.dto.StudyGoalResponse;
import com.pinpoint.backend.dto.UpdateStudyGoalRequest;

public interface StudyGoalService {

    List<StudyGoalResponse> getGoals();

    StudyGoalResponse createGoal(StudyGoalRequest request);

    StudyGoalResponse updateGoal(Long id, UpdateStudyGoalRequest request);

    void deleteGoal(Long id);
}
