package com.pinpoint.backend.service;

import com.pinpoint.backend.entity.ContentType;
import com.pinpoint.backend.util.YoutubeMetadata;

public interface YoutubeMetadataService {

    YoutubeMetadata fetchMetadata(String normalizedUrl, ContentType contentType);
}
