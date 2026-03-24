package com.pinpoint.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pinpoint.backend.dto.StudyQueueItemResponse;
import com.pinpoint.backend.entity.StudyQueueItem;
import com.pinpoint.backend.exception.ContentNotFoundException;
import com.pinpoint.backend.repository.SavedContentRepository;
import com.pinpoint.backend.repository.StudyQueueItemRepository;
import com.pinpoint.backend.service.StudyQueueService;
import com.pinpoint.backend.util.SavedContentMapper;

@Service
@Transactional
public class StudyQueueServiceImpl implements StudyQueueService {

    private final StudyQueueItemRepository studyQueueItemRepository;
    private final SavedContentRepository savedContentRepository;

    public StudyQueueServiceImpl(
            StudyQueueItemRepository studyQueueItemRepository,
            SavedContentRepository savedContentRepository
    ) {
        this.studyQueueItemRepository = studyQueueItemRepository;
        this.savedContentRepository = savedContentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudyQueueItemResponse> getQueue() {
        return studyQueueItemRepository.findAllByOrderByPositionAscCreatedAtAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public StudyQueueItemResponse addToQueue(Long contentId) {
        StudyQueueItem existing = studyQueueItemRepository.findByContentId(contentId).orElse(null);
        if (existing != null) {
            return toResponse(existing);
        }

        var content = savedContentRepository.findById(contentId)
                .orElseThrow(() -> new ContentNotFoundException("Content not found for id " + contentId));

        int nextPosition = studyQueueItemRepository.findAllByOrderByPositionAscCreatedAtAsc().size() + 1;

        StudyQueueItem created = StudyQueueItem.builder()
                .content(content)
                .position(nextPosition)
                .build();

        return toResponse(studyQueueItemRepository.save(created));
    }

    @Override
    public void removeFromQueue(Long queueItemId) {
        StudyQueueItem queueItem = studyQueueItemRepository.findById(queueItemId)
                .orElseThrow(() -> new ContentNotFoundException("Study queue item not found for id " + queueItemId));
        studyQueueItemRepository.delete(queueItem);
        normalizePositions();
    }

    private void normalizePositions() {
        List<StudyQueueItem> items = studyQueueItemRepository.findAllByOrderByPositionAscCreatedAtAsc();
        for (int index = 0; index < items.size(); index++) {
            items.get(index).setPosition(index + 1);
        }
        studyQueueItemRepository.saveAll(items);
    }

    private StudyQueueItemResponse toResponse(StudyQueueItem item) {
        return StudyQueueItemResponse.builder()
                .id(item.getId())
                .position(item.getPosition())
                .createdAt(item.getCreatedAt())
                .content(SavedContentMapper.toResponse(item.getContent()))
                .build();
    }
}
