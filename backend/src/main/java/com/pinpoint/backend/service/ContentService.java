package com.pinpoint.backend.service;

import com.pinpoint.backend.dto.request.AssignFolderRequest;
import com.pinpoint.backend.dto.request.CreateContentRequest;
import com.pinpoint.backend.entity.ContentType;
import com.pinpoint.backend.dto.response.SavedContentResponse;

import java.util.List;

public interface ContentService {

    SavedContentResponse create(CreateContentRequest request);

    List<SavedContentResponse> getAll(Long folderId, String search, String sort, Boolean pinned, ContentType contentType);

    SavedContentResponse getById(Long id);

    SavedContentResponse togglePinned(Long id);

    SavedContentResponse assignFolder(Long id, AssignFolderRequest request);

    void delete(Long id);
}
