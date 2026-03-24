package com.pinpoint.backend.service;

import java.util.List;

import com.pinpoint.backend.dto.AddContentRequest;
import com.pinpoint.backend.dto.SavedContentResponse;
import com.pinpoint.backend.dto.UpdateContentRequest;
import com.pinpoint.backend.dto.UpdateContentProgressRequest;
import com.pinpoint.backend.entity.ContentType;

public interface ContentService {

    SavedContentResponse addContent(AddContentRequest request);

    List<SavedContentResponse> getAllContent(Long folderId, String search, String sort, Boolean pinned, ContentType contentType);

    SavedContentResponse getContentById(Long id);

    SavedContentResponse togglePinned(Long id);

    SavedContentResponse updateContent(Long id, UpdateContentRequest request);

    SavedContentResponse updatePlaybackProgress(Long id, UpdateContentProgressRequest request);

    SavedContentResponse updateFolder(Long id, Long folderId);

    SavedContentResponse markOpened(Long id);

    List<SavedContentResponse> getContinueLearning();

    List<SavedContentResponse> getRecentlyWatched();

    void deleteContent(Long id);
}
