package com.pinpoint.backend.dto.response;

import com.pinpoint.backend.entity.ContentType;

public class YoutubeMetadata {

    private final String normalizedUrl;
    private final ContentType contentType;
    private final String title;
    private final String channelName;
    private final String thumbnailUrl;

    public YoutubeMetadata(
            String normalizedUrl,
            ContentType contentType,
            String title,
            String channelName,
            String thumbnailUrl
    ) {
        this.normalizedUrl = normalizedUrl;
        this.contentType = contentType;
        this.title = title;
        this.channelName = channelName;
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getNormalizedUrl() {
        return normalizedUrl;
    }

    public ContentType getContentType() {
        return contentType;
    }

    public String getTitle() {
        return title;
    }

    public String getChannelName() {
        return channelName;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }
}
