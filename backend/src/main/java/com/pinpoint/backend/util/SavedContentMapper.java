package com.pinpoint.backend.util;

import com.pinpoint.backend.dto.SavedContentResponse;
import com.pinpoint.backend.entity.SavedContent;

public final class SavedContentMapper {

    private SavedContentMapper() {
    }

    public static SavedContentResponse toResponse(SavedContent savedContent) {
        return SavedContentResponse.builder()
                .id(savedContent.getId())
                .title(savedContent.getTitle())
                .url(savedContent.getUrl())
                .contentType(savedContent.getContentType())
                .channelName(savedContent.getChannelName())
                .thumbnailUrl(savedContent.getThumbnailUrl())
                .pinned(savedContent.isPinned())
                .createdAt(savedContent.getCreatedAt())
                .updatedAt(savedContent.getUpdatedAt())
                .build();
    }
}
