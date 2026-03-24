package com.pinpoint.backend.dto;

import java.time.LocalDateTime;

import com.pinpoint.backend.entity.ContentType;
import com.pinpoint.backend.entity.LearningStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SavedContentResponse {

    private Long id;
    private String title;
    private String url;
    private ContentType contentType;
    private String channelName;
    private String thumbnailUrl;
    private Long folderId;
    private String folderName;
    private boolean pinned;
    private LearningStatus status;
    private int progressPercent;
    private String notes;
    private String tags;
    private LocalDateTime lastOpenedAt;
    private Integer lastPlaybackSeconds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
