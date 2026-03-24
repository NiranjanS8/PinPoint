package com.pinpoint.backend.service.impl;

import com.pinpoint.backend.dto.request.AssignFolderRequest;
import com.pinpoint.backend.dto.request.CreateContentRequest;
import com.pinpoint.backend.dto.response.SavedContentResponse;
import com.pinpoint.backend.dto.response.YoutubeMetadata;
import com.pinpoint.backend.entity.ContentType;
import com.pinpoint.backend.entity.Folder;
import com.pinpoint.backend.entity.SavedContent;
import com.pinpoint.backend.exception.ContentNotFoundException;
import com.pinpoint.backend.exception.DuplicateContentException;
import com.pinpoint.backend.exception.FolderNotFoundException;
import com.pinpoint.backend.repository.FolderRepository;
import com.pinpoint.backend.repository.SavedContentRepository;
import com.pinpoint.backend.service.ContentService;
import com.pinpoint.backend.service.MetadataService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class ContentServiceImpl implements ContentService {

    private final SavedContentRepository savedContentRepository;
    private final FolderRepository folderRepository;
    private final MetadataService metadataService;

    public ContentServiceImpl(
            SavedContentRepository savedContentRepository,
            FolderRepository folderRepository,
            MetadataService metadataService
    ) {
        this.savedContentRepository = savedContentRepository;
        this.folderRepository = folderRepository;
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
    public List<SavedContentResponse> getAll(Long folderId, String search, String sort, Boolean pinned, ContentType contentType) {
        return savedContentRepository.findAll()
                .stream()
                .filter(content -> folderId == null || matchesFolder(content, folderId))
                .filter(content -> pinned == null || content.getPinned().equals(pinned))
                .filter(content -> contentType == null || content.getContentType() == contentType)
                .filter(content -> matchesSearch(content, search))
                .sorted(resolveSortComparator(sort))
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
    public SavedContentResponse assignFolder(Long id, AssignFolderRequest request) {
        SavedContent savedContent = findEntityById(id);
        Folder folder = request == null || request.getFolderId() == null
                ? null
                : folderRepository.findById(request.getFolderId())
                    .orElseThrow(() -> new FolderNotFoundException("Folder not found for id " + request.getFolderId() + "."));
        savedContent.setFolder(folder);
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
        response.setFolderId(savedContent.getFolder() == null ? null : savedContent.getFolder().getId());
        response.setFolderName(savedContent.getFolder() == null ? null : savedContent.getFolder().getName());
        response.setCreatedAt(savedContent.getCreatedAt());
        response.setUpdatedAt(savedContent.getUpdatedAt());
        return response;
    }

    private boolean matchesFolder(SavedContent content, Long folderId) {
        return content.getFolder() != null && content.getFolder().getId().equals(folderId);
    }

    private boolean matchesSearch(SavedContent content, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }

        String normalizedSearch = search.trim().toLowerCase(Locale.ENGLISH);
        return content.getTitle().toLowerCase(Locale.ENGLISH).contains(normalizedSearch)
                || content.getChannelName().toLowerCase(Locale.ENGLISH).contains(normalizedSearch);
    }

    private Comparator<SavedContent> resolveSortComparator(String sort) {
        String normalizedSort = sort == null ? "PINNED_FIRST" : sort.trim().toUpperCase(Locale.ENGLISH);
        return switch (normalizedSort) {
            case "NEWEST" -> Comparator.comparing(SavedContent::getCreatedAt).reversed();
            case "OLDEST" -> Comparator.comparing(SavedContent::getCreatedAt);
            case "ALPHABETICAL" -> Comparator.comparing(content -> content.getTitle().toLowerCase(Locale.ENGLISH));
            case "PINNED_FIRST" -> Comparator.comparing(SavedContent::getPinned).reversed()
                    .thenComparing(SavedContent::getCreatedAt, Comparator.reverseOrder());
            default -> Comparator.comparing(SavedContent::getPinned).reversed()
                    .thenComparing(SavedContent::getCreatedAt, Comparator.reverseOrder());
        };
    }
}
