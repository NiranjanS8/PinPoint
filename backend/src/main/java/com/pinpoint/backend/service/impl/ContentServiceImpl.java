package com.pinpoint.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pinpoint.backend.dto.AddContentRequest;
import com.pinpoint.backend.dto.SavedContentResponse;
import com.pinpoint.backend.entity.ContentType;
import com.pinpoint.backend.entity.SavedContent;
import com.pinpoint.backend.exception.ContentNotFoundException;
import com.pinpoint.backend.exception.DuplicateContentException;
import com.pinpoint.backend.exception.InvalidYoutubeUrlException;
import com.pinpoint.backend.repository.SavedContentRepository;
import com.pinpoint.backend.service.ContentService;
import com.pinpoint.backend.service.YoutubeMetadataService;
import com.pinpoint.backend.util.SavedContentMapper;
import com.pinpoint.backend.util.YoutubeMetadata;
import com.pinpoint.backend.util.YoutubeUrlUtils;

@Service
@Transactional
public class ContentServiceImpl implements ContentService {

    private final SavedContentRepository savedContentRepository;
    private final YoutubeUrlUtils youtubeUrlUtils;
    private final YoutubeMetadataService youtubeMetadataService;

    public ContentServiceImpl(
            SavedContentRepository savedContentRepository,
            YoutubeUrlUtils youtubeUrlUtils,
            YoutubeMetadataService youtubeMetadataService
    ) {
        this.savedContentRepository = savedContentRepository;
        this.youtubeUrlUtils = youtubeUrlUtils;
        this.youtubeMetadataService = youtubeMetadataService;
    }

    @Override
    public SavedContentResponse addContent(AddContentRequest request) {
        String rawUrl = request.getUrl();

        if (!youtubeUrlUtils.isYoutubeUrl(rawUrl)) {
            throw new InvalidYoutubeUrlException("Only YouTube video or playlist URLs are supported");
        }

        ContentType contentType = youtubeUrlUtils.detectContentType(rawUrl);
        String normalizedUrl = youtubeUrlUtils.normalizeUrl(rawUrl);

        if (savedContentRepository.existsByNormalizedUrl(normalizedUrl)) {
            throw new DuplicateContentException("Content already exists for this YouTube URL");
        }

        YoutubeMetadata metadata = youtubeMetadataService.fetchMetadata(normalizedUrl, contentType);

        SavedContent savedContent = SavedContent.builder()
                .title(metadata.getTitle())
                .url(rawUrl.trim())
                .normalizedUrl(normalizedUrl)
                .contentType(contentType)
                .channelName(metadata.getChannelName())
                .thumbnailUrl(metadata.getThumbnailUrl())
                .pinned(false)
                .build();

        return SavedContentMapper.toResponse(savedContentRepository.save(savedContent));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SavedContentResponse> getAllContent() {
        return savedContentRepository.findAllByOrderByPinnedDescCreatedAtDesc()
                .stream()
                .map(SavedContentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SavedContentResponse getContentById(Long id) {
        return SavedContentMapper.toResponse(findById(id));
    }

    @Override
    public SavedContentResponse togglePinned(Long id) {
        SavedContent savedContent = findById(id);
        savedContent.setPinned(!savedContent.isPinned());
        return SavedContentMapper.toResponse(savedContentRepository.save(savedContent));
    }

    @Override
    public void deleteContent(Long id) {
        SavedContent savedContent = findById(id);
        savedContentRepository.delete(savedContent);
    }

    private SavedContent findById(Long id) {
        return savedContentRepository.findById(id)
                .orElseThrow(() -> new ContentNotFoundException("Content not found for id " + id));
    }
}
