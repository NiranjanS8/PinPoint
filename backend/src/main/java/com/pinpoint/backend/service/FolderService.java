package com.pinpoint.backend.service;

import java.util.List;

import com.pinpoint.backend.dto.FolderRequest;
import com.pinpoint.backend.dto.FolderResponse;
import com.pinpoint.backend.dto.FolderTreeResponse;
import com.pinpoint.backend.dto.UpdateFolderRequest;

public interface FolderService {

    FolderResponse createFolder(FolderRequest request);

    List<FolderResponse> getAllFolders();

    List<FolderTreeResponse> getFolderTree();

    FolderResponse updateFolder(Long id, UpdateFolderRequest request);

    void deleteFolder(Long id);
}
