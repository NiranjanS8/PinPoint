package com.pinpoint.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pinpoint.backend.entity.SavedContent;

public interface SavedContentRepository extends JpaRepository<SavedContent, Long> {

    boolean existsByNormalizedUrl(String normalizedUrl);

    Optional<SavedContent> findByNormalizedUrl(String normalizedUrl);

    List<SavedContent> findAllByOrderByPinnedDescCreatedAtDesc();
}
