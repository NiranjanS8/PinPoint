package com.pinpoint.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pinpoint.backend.dto.StudyGoalRequest;
import com.pinpoint.backend.dto.StudyGoalResponse;
import com.pinpoint.backend.dto.UpdateStudyGoalRequest;
import com.pinpoint.backend.service.StudyGoalService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/goals")
@Validated
public class StudyGoalController {

    private final StudyGoalService studyGoalService;

    public StudyGoalController(StudyGoalService studyGoalService) {
        this.studyGoalService = studyGoalService;
    }

    @GetMapping
    public ResponseEntity<List<StudyGoalResponse>> getGoals() {
        return ResponseEntity.ok(studyGoalService.getGoals());
    }

    @PostMapping
    public ResponseEntity<StudyGoalResponse> createGoal(@Valid @RequestBody StudyGoalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studyGoalService.createGoal(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudyGoalResponse> updateGoal(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStudyGoalRequest request
    ) {
        return ResponseEntity.ok(studyGoalService.updateGoal(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        studyGoalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
}
