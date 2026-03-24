package com.pinpoint.backend.service;

import com.pinpoint.backend.dto.request.CreateContentRequest;
import com.pinpoint.backend.dto.response.SavedContentResponse;

import java.util.List;

public interface ContentService {

    SavedContentResponse create(CreateContentRequest request);

    List<SavedContentResponse> getAll();

    SavedContentResponse getById(Long id);

    SavedContentResponse togglePinned(Long id);

    void delete(Long id);
}
