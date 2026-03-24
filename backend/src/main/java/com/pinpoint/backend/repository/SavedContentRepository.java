package com.pinpoint.backend.repository;

import com.pinpoint.backend.entity.SavedContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedContentRepository extends JpaRepository<SavedContent, Long> {

    boolean existsByUrl(String url);

    Optional<SavedContent> findByUrl(String url);

    List<SavedContent> findAllByOrderByPinnedDescCreatedAtDesc();
}
