package com.pinpoint.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pinpoint.backend.dto.StudyQueueItemResponse;
import com.pinpoint.backend.dto.StudyQueueRequest;
import com.pinpoint.backend.service.StudyQueueService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/study-queue")
@Validated
public class StudyQueueController {

    private final StudyQueueService studyQueueService;

    public StudyQueueController(StudyQueueService studyQueueService) {
        this.studyQueueService = studyQueueService;
    }

    @GetMapping
    public ResponseEntity<List<StudyQueueItemResponse>> getQueue() {
        return ResponseEntity.ok(studyQueueService.getQueue());
    }

    @PostMapping
    public ResponseEntity<StudyQueueItemResponse> addToQueue(@Valid @RequestBody StudyQueueRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studyQueueService.addToQueue(request.getContentId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromQueue(@PathVariable Long id) {
        studyQueueService.removeFromQueue(id);
        return ResponseEntity.noContent().build();
    }
}
