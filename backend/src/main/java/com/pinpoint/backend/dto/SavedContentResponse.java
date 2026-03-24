package com.pinpoint.backend.dto;

import java.time.LocalDateTime;

import com.pinpoint.backend.entity.ContentType;

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
    private boolean pinned;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
