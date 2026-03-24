package com.pinpoint.backend.service.impl;

import com.pinpoint.backend.dto.request.CreateContentRequest;
import com.pinpoint.backend.dto.response.SavedContentResponse;
import com.pinpoint.backend.dto.response.YoutubeMetadata;
import com.pinpoint.backend.entity.SavedContent;
import com.pinpoint.backend.exception.ContentNotFoundException;
import com.pinpoint.backend.exception.DuplicateContentException;
import com.pinpoint.backend.repository.SavedContentRepository;
import com.pinpoint.backend.service.ContentService;
import com.pinpoint.backend.service.MetadataService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ContentServiceImpl implements ContentService {

    private final SavedContentRepository savedContentRepository;
    private final MetadataService metadataService;

    public ContentServiceImpl(SavedContentRepository savedContentRepository, MetadataService metadataService) {
        this.savedContentRepository = savedContentRepository;
        this.metadataService = metadataService;
    }

    @Override
    public SavedContentResponse create(CreateContentRequest request) {
        YoutubeMetadata metadata = metadataService.extract(request.getUrl());

        if (savedContentRepository.existsByUrl(metadata.getNormalizedUrl())) {
            throw new DuplicateContentException("Already added.");
        }

        SavedContent savedContent = new SavedContent();
        savedContent.setTitle(metadata.getTitle());
        savedContent.setUrl(metadata.getNormalizedUrl());
        savedContent.setContentType(metadata.getContentType());
        savedContent.setChannelName(metadata.getChannelName());
        savedContent.setThumbnailUrl(metadata.getThumbnailUrl());
        savedContent.setPinned(false);

        return toResponse(savedContentRepository.save(savedContent));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SavedContentResponse> getAll() {
        return savedContentRepository.findAllByOrderByPinnedDescCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SavedContentResponse getById(Long id) {
        return toResponse(findEntityById(id));
    }

    @Override
    public SavedContentResponse togglePinned(Long id) {
        SavedContent savedContent = findEntityById(id);
        savedContent.setPinned(!savedContent.getPinned());
        return toResponse(savedContentRepository.save(savedContent));
    }

    @Override
    public void delete(Long id) {
        SavedContent savedContent = findEntityById(id);
        savedContentRepository.delete(savedContent);
    }

    private SavedContent findEntityById(Long id) {
        return savedContentRepository.findById(id)
                .orElseThrow(() -> new ContentNotFoundException("Content not found for id " + id + "."));
    }

    private SavedContentResponse toResponse(SavedContent savedContent) {
        SavedContentResponse response = new SavedContentResponse();
        response.setId(savedContent.getId());
        response.setTitle(savedContent.getTitle());
        response.setUrl(savedContent.getUrl());
        response.setContentType(savedContent.getContentType());
        response.setChannelName(savedContent.getChannelName());
        response.setThumbnailUrl(savedContent.getThumbnailUrl());
        response.setPinned(savedContent.getPinned());
        response.setCreatedAt(savedContent.getCreatedAt());
        response.setUpdatedAt(savedContent.getUpdatedAt());
        return response;
    }
}
