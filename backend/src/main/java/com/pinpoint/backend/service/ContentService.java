package com.pinpoint.backend.service;

import java.util.List;

import com.pinpoint.backend.dto.AddContentRequest;
import com.pinpoint.backend.dto.SavedContentResponse;

public interface ContentService {

    SavedContentResponse addContent(AddContentRequest request);

    List<SavedContentResponse> getAllContent();

    SavedContentResponse getContentById(Long id);

    SavedContentResponse togglePinned(Long id);

    void deleteContent(Long id);
}
