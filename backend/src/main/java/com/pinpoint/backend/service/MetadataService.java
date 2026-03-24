package com.pinpoint.backend.service;

import com.pinpoint.backend.dto.response.YoutubeMetadata;

public interface MetadataService {

    YoutubeMetadata extract(String rawUrl);
}
