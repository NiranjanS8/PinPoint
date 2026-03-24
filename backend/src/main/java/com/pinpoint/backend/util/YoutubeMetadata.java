package com.pinpoint.backend.util;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class YoutubeMetadata {

    private String title;
    private String channelName;
    private String thumbnailUrl;
}
