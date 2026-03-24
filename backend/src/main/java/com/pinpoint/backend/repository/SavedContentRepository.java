package com.pinpoint.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pinpoint.backend.entity.SavedContent;

public interface SavedContentRepository extends JpaRepository<SavedContent, Long> {

    boolean existsByNormalizedUrl(String normalizedUrl);

    Optional<SavedContent> findByNormalizedUrl(String normalizedUrl);

    List<SavedContent> findAllByOrderByPinnedDescCreatedAtDesc();

    List<SavedContent> findAllByLastOpenedAtIsNotNullOrderByLastOpenedAtDesc();

    @Modifying
    @Query("update SavedContent content set content.folder = null where content.folder.id in :folderIds")
    void clearFolderAssignments(@Param("folderIds") List<Long> folderIds);
}
