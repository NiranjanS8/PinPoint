package com.pinpoint.backend.service;

import java.util.List;

import com.pinpoint.backend.dto.StudyQueueItemResponse;

public interface StudyQueueService {

    List<StudyQueueItemResponse> getQueue();

    StudyQueueItemResponse addToQueue(Long contentId);

    void removeFromQueue(Long queueItemId);
}
