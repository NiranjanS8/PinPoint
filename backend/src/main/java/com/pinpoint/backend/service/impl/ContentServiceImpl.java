package com.pinpoint.backend.service.impl;

import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pinpoint.backend.dto.AddContentRequest;
import com.pinpoint.backend.dto.SavedContentResponse;
import com.pinpoint.backend.dto.UpdateContentRequest;
import com.pinpoint.backend.dto.UpdateContentProgressRequest;
import com.pinpoint.backend.entity.ContentType;
import com.pinpoint.backend.entity.Folder;
import com.pinpoint.backend.entity.LearningStatus;
import com.pinpoint.backend.entity.SavedContent;
import com.pinpoint.backend.exception.ContentNotFoundException;
import com.pinpoint.backend.exception.DuplicateContentException;
import com.pinpoint.backend.exception.FolderNotFoundException;
import com.pinpoint.backend.exception.InvalidYoutubeUrlException;
import com.pinpoint.backend.exception.InvalidFolderOperationException;
import com.pinpoint.backend.repository.FolderRepository;
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
    private final FolderRepository folderRepository;
    private final YoutubeUrlUtils youtubeUrlUtils;
    private final YoutubeMetadataService youtubeMetadataService;

    public ContentServiceImpl(
            SavedContentRepository savedContentRepository,
            FolderRepository folderRepository,
            YoutubeUrlUtils youtubeUrlUtils,
            YoutubeMetadataService youtubeMetadataService
    ) {
        this.savedContentRepository = savedContentRepository;
        this.folderRepository = folderRepository;
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
                .status(LearningStatus.NOT_STARTED)
                .progressPercent(0)
                .notes("")
                .tags("")
                .build();

        return SavedContentMapper.toResponse(savedContentRepository.save(savedContent));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SavedContentResponse> getAllContent(
            Long folderId,
            String search,
            String sort,
            Boolean pinned,
            ContentType contentType
    ) {
        Stream<SavedContent> filteredStream = savedContentRepository.findAll().stream()
                .filter(content -> folderId == null || Objects.equals(
                        content.getFolder() != null ? content.getFolder().getId() : null,
                        folderId
                ))
                .filter(content -> pinned == null || content.isPinned() == pinned)
                .filter(content -> contentType == null || content.getContentType() == contentType)
                .filter(content -> matchesSearch(content, search));

        return filteredStream
                .sorted(resolveComparator(sort))
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
    public SavedContentResponse updateContent(Long id, UpdateContentRequest request) {
        SavedContent savedContent = findById(id);

        int progressPercent = request.getProgressPercent() != null
                ? request.getProgressPercent()
                : savedContent.getProgressPercent();
        LearningStatus status = request.getStatus() != null
                ? request.getStatus()
                : savedContent.getStatus();

        if (request.getStatus() != null && request.getProgressPercent() == null) {
            progressPercent = defaultProgressForStatus(request.getStatus(), savedContent.getProgressPercent());
        }
        if (request.getStatus() == null && request.getProgressPercent() != null) {
            status = deriveStatusFromProgress(request.getProgressPercent());
        }

        validateWorkflowState(status, progressPercent);

        savedContent.setStatus(status);
        savedContent.setProgressPercent(progressPercent);

        if (request.getNotes() != null) {
            savedContent.setNotes(request.getNotes().trim());
        }
        if (request.getTags() != null) {
            savedContent.setTags(normalizeTags(request.getTags()));
        }

        return SavedContentMapper.toResponse(savedContentRepository.save(savedContent));
    }

    @Override
    public SavedContentResponse updatePlaybackProgress(Long id, UpdateContentProgressRequest request) {
        SavedContent savedContent = findById(id);

        int progressPercent = request.getProgressPercent() != null
                ? request.getProgressPercent()
                : savedContent.getProgressPercent();
        LearningStatus status = request.getStatus() != null
                ? request.getStatus()
                : deriveStatusFromProgress(progressPercent);

        validateWorkflowState(status, progressPercent);

        if (request.getLastPlaybackSeconds() != null && request.getLastPlaybackSeconds() < 0) {
            throw new InvalidFolderOperationException("Playback position must be zero or greater");
        }

        savedContent.setStatus(status);
        savedContent.setProgressPercent(progressPercent);
        if (request.getLastPlaybackSeconds() != null) {
            savedContent.setLastPlaybackSeconds(request.getLastPlaybackSeconds());
        }
        savedContent.setLastOpenedAt(java.time.LocalDateTime.now());

        return SavedContentMapper.toResponse(savedContentRepository.save(savedContent));
    }

    @Override
    public SavedContentResponse updateFolder(Long id, Long folderId) {
        SavedContent savedContent = findById(id);
        savedContent.setFolder(resolveFolder(folderId));
        return SavedContentMapper.toResponse(savedContentRepository.save(savedContent));
    }

    @Override
    public SavedContentResponse markOpened(Long id) {
        SavedContent savedContent = findById(id);
        savedContent.setLastOpenedAt(java.time.LocalDateTime.now());
        return SavedContentMapper.toResponse(savedContentRepository.save(savedContent));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SavedContentResponse> getContinueLearning() {
        return savedContentRepository.findAll().stream()
                .filter(content -> content.getStatus() == LearningStatus.IN_PROGRESS || content.getLastOpenedAt() != null)
                .sorted(
                        java.util.Comparator.comparing((SavedContent content) -> content.getStatus() == LearningStatus.IN_PROGRESS)
                                .reversed()
                                .thenComparing(
                                        SavedContent::getLastOpenedAt,
                                        java.util.Comparator.nullsLast(java.util.Comparator.reverseOrder())
                                )
                                .thenComparing(SavedContent::getUpdatedAt, java.util.Comparator.reverseOrder())
                )
                .limit(4)
                .map(SavedContentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SavedContentResponse> getRecentlyWatched() {
        return savedContentRepository.findAllByLastOpenedAtIsNotNullOrderByLastOpenedAtDesc().stream()
                .map(SavedContentMapper::toResponse)
                .toList();
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

    private Folder resolveFolder(Long folderId) {
        if (folderId == null) {
            return null;
        }

        return folderRepository.findById(folderId)
                .orElseThrow(() -> new FolderNotFoundException("Folder not found for id " + folderId));
    }

    private boolean matchesSearch(SavedContent content, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }

        String normalizedSearch = search.trim().toLowerCase(Locale.ROOT);
        return content.getTitle().toLowerCase(Locale.ROOT).contains(normalizedSearch)
                || content.getChannelName().toLowerCase(Locale.ROOT).contains(normalizedSearch);
    }

    private java.util.Comparator<SavedContent> resolveComparator(String sort) {
        String normalizedSort = sort == null ? "pinned" : sort.trim().toLowerCase(Locale.ROOT);

        return switch (normalizedSort) {
            case "newest" -> java.util.Comparator.comparing(SavedContent::getCreatedAt).reversed();
            case "oldest" -> java.util.Comparator.comparing(SavedContent::getCreatedAt);
            case "alphabetical" -> java.util.Comparator.comparing(
                    SavedContent::getTitle,
                    String.CASE_INSENSITIVE_ORDER
            );
            case "pinned", "pinnedfirst" -> java.util.Comparator
                    .comparing(SavedContent::isPinned)
                    .reversed()
                    .thenComparing(SavedContent::getCreatedAt, java.util.Comparator.reverseOrder());
            default -> throw new InvalidFolderOperationException("Unsupported sort value: " + sort);
        };
    }

    private void validateWorkflowState(LearningStatus status, int progressPercent) {
        if (progressPercent < 0 || progressPercent > 100) {
            throw new InvalidFolderOperationException("Progress percent must be between 0 and 100");
        }

        switch (status) {
            case COMPLETED -> {
                if (progressPercent != 100) {
                    throw new InvalidFolderOperationException("Completed content must have 100 percent progress");
                }
            }
            case NOT_STARTED -> {
                if (progressPercent != 0) {
                    throw new InvalidFolderOperationException("Not started content must have 0 percent progress");
                }
            }
            case IN_PROGRESS -> {
                if (progressPercent < 1 || progressPercent > 99) {
                    throw new InvalidFolderOperationException("In progress content must have 1 to 99 percent progress");
                }
            }
            default -> throw new InvalidFolderOperationException("Unsupported learning status");
        }
    }

    private int defaultProgressForStatus(LearningStatus status, int currentProgress) {
        return switch (status) {
            case NOT_STARTED -> 0;
            case COMPLETED -> 100;
            case IN_PROGRESS -> currentProgress > 0 && currentProgress < 100 ? currentProgress : 1;
        };
    }

    private LearningStatus deriveStatusFromProgress(int progressPercent) {
        if (progressPercent == 0) {
            return LearningStatus.NOT_STARTED;
        }
        if (progressPercent == 100) {
            return LearningStatus.COMPLETED;
        }
        return LearningStatus.IN_PROGRESS;
    }

    private String normalizeTags(String rawTags) {
        if (rawTags == null || rawTags.isBlank()) {
            return "";
        }

        return Stream.of(rawTags.split(","))
                .map(String::trim)
                .filter(tag -> !tag.isBlank())
                .map(tag -> tag.toLowerCase(Locale.ROOT))
                .distinct()
                .limit(20)
                .reduce((left, right) -> left + "," + right)
                .orElse("");
    }
}
