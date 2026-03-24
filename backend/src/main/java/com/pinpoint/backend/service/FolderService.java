package com.pinpoint.backend.service;

import com.pinpoint.backend.dto.request.CreateFolderRequest;
import com.pinpoint.backend.dto.request.UpdateFolderRequest;
import com.pinpoint.backend.dto.response.FolderResponse;
import com.pinpoint.backend.dto.response.FolderTreeNodeResponse;

import java.util.List;

public interface FolderService {

    FolderResponse create(CreateFolderRequest request);

    List<FolderResponse> getAll();

    List<FolderTreeNodeResponse> getTree();

    FolderResponse update(Long id, UpdateFolderRequest request);

    void delete(Long id);
}
