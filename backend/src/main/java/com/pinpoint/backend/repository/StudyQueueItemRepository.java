package com.pinpoint.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pinpoint.backend.entity.StudyQueueItem;

public interface StudyQueueItemRepository extends JpaRepository<StudyQueueItem, Long> {

    List<StudyQueueItem> findAllByOrderByPositionAscCreatedAtAsc();

    Optional<StudyQueueItem> findByContentId(Long contentId);
}
