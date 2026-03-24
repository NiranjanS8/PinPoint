package com.pinpoint.backend.service.impl;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pinpoint.backend.dto.FolderRequest;
import com.pinpoint.backend.dto.FolderResponse;
import com.pinpoint.backend.dto.FolderTreeResponse;
import com.pinpoint.backend.dto.UpdateFolderRequest;
import com.pinpoint.backend.entity.Folder;
import com.pinpoint.backend.exception.FolderNotFoundException;
import com.pinpoint.backend.exception.InvalidFolderOperationException;
import com.pinpoint.backend.repository.FolderRepository;
import com.pinpoint.backend.repository.SavedContentRepository;
import com.pinpoint.backend.service.FolderService;

@Service
@Transactional
public class FolderServiceImpl implements FolderService {

    private final FolderRepository folderRepository;
    private final SavedContentRepository savedContentRepository;

    public FolderServiceImpl(FolderRepository folderRepository, SavedContentRepository savedContentRepository) {
        this.folderRepository = folderRepository;
        this.savedContentRepository = savedContentRepository;
    }

    @Override
    public FolderResponse createFolder(FolderRequest request) {
        Folder parent = resolveParent(request.getParentId());
        validateDuplicateSiblingName(request.getName(), parent, null);

        Folder folder = Folder.builder()
                .name(request.getName().trim())
                .description(normalizeDescription(request.getDescription()))
                .parent(parent)
                .build();

        return toResponse(folderRepository.save(folder));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FolderResponse> getAllFolders() {
        return folderRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FolderTreeResponse> getFolderTree() {
        List<Folder> folders = folderRepository.findAllByOrderByNameAsc();
        Map<Long, List<Folder>> childrenByParentId = new HashMap<>();

        for (Folder folder : folders) {
            Long parentId = folder.getParent() != null ? folder.getParent().getId() : null;
            childrenByParentId.computeIfAbsent(parentId, ignored -> new ArrayList<>()).add(folder);
        }

        return childrenByParentId.getOrDefault(null, List.of())
                .stream()
                .sorted(Comparator.comparing(Folder::getName, String.CASE_INSENSITIVE_ORDER))
                .map(folder -> toTreeResponse(folder, childrenByParentId))
                .toList();
    }

    @Override
    public FolderResponse updateFolder(Long id, UpdateFolderRequest request) {
        Folder folder = findFolder(id);
        Folder parent = resolveParent(request.getParentId());

        validateParent(folder, parent);
        validateDuplicateSiblingName(request.getName(), parent, folder.getId());

        folder.setName(request.getName().trim());
        folder.setDescription(normalizeDescription(request.getDescription()));
        folder.setParent(parent);

        return toResponse(folderRepository.save(folder));
    }

    @Override
    public void deleteFolder(Long id) {
        Folder folder = findFolder(id);
        List<Folder> allFolders = folderRepository.findAll();
        List<Long> folderIdsToDelete = collectDescendantIds(folder, allFolders);

        savedContentRepository.clearFolderAssignments(folderIdsToDelete);
        folderRepository.deleteAllById(folderIdsToDelete);
    }

    private Folder resolveParent(Long parentId) {
        if (parentId == null) {
            return null;
        }

        return findFolder(parentId);
    }

    private void validateParent(Folder folder, Folder parent) {
        if (parent == null) {
            return;
        }

        if (folder.getId().equals(parent.getId())) {
            throw new InvalidFolderOperationException("A folder cannot be its own parent");
        }

        List<Folder> allFolders = folderRepository.findAll();
        Long currentParentId = parent.getParent() != null ? parent.getParent().getId() : null;

        while (currentParentId != null) {
            if (currentParentId.equals(folder.getId())) {
                throw new InvalidFolderOperationException("Circular folder nesting is not allowed");
            }

            Long lookupParentId = currentParentId;
            Folder currentParent = allFolders.stream()
                    .filter(candidate -> candidate.getId().equals(lookupParentId))
                    .findFirst()
                    .orElse(null);

            currentParentId = currentParent != null && currentParent.getParent() != null
                    ? currentParent.getParent().getId()
                    : null;
        }
    }

    private void validateDuplicateSiblingName(String requestedName, Folder parent, Long currentFolderId) {
        String normalizedName = requestedName.trim().toLowerCase();
        Long parentId = parent != null ? parent.getId() : null;

        boolean duplicateExists = folderRepository.findAll().stream().anyMatch(folder -> {
            if (currentFolderId != null && folder.getId().equals(currentFolderId)) {
                return false;
            }

            Long existingParentId = folder.getParent() != null ? folder.getParent().getId() : null;
            return normalizedName.equals(folder.getName().trim().toLowerCase())
                    && java.util.Objects.equals(parentId, existingParentId);
        });

        if (duplicateExists) {
            throw new InvalidFolderOperationException("A folder with that name already exists in this location");
        }
    }

    private List<Long> collectDescendantIds(Folder rootFolder, List<Folder> allFolders) {
        List<Long> result = new ArrayList<>();
        result.add(rootFolder.getId());

        boolean added;
        do {
            added = false;
            for (Folder folder : allFolders) {
                Long parentId = folder.getParent() != null ? folder.getParent().getId() : null;
                if (parentId != null && result.contains(parentId) && !result.contains(folder.getId())) {
                    result.add(folder.getId());
                    added = true;
                }
            }
        } while (added);

        return result;
    }

    private FolderTreeResponse toTreeResponse(Folder folder, Map<Long, List<Folder>> childrenByParentId) {
        List<FolderTreeResponse> children = childrenByParentId
                .getOrDefault(folder.getId(), List.of())
                .stream()
                .sorted(Comparator.comparing(Folder::getName, String.CASE_INSENSITIVE_ORDER))
                .map(child -> toTreeResponse(child, childrenByParentId))
                .toList();

        return FolderTreeResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .description(folder.getDescription())
                .parentId(folder.getParent() != null ? folder.getParent().getId() : null)
                .createdAt(folder.getCreatedAt())
                .updatedAt(folder.getUpdatedAt())
                .children(children)
                .build();
    }

    private FolderResponse toResponse(Folder folder) {
        return FolderResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .description(folder.getDescription())
                .parentId(folder.getParent() != null ? folder.getParent().getId() : null)
                .createdAt(folder.getCreatedAt())
                .updatedAt(folder.getUpdatedAt())
                .build();
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }

        String trimmed = description.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Folder findFolder(Long id) {
        return folderRepository.findById(id)
                .orElseThrow(() -> new FolderNotFoundException("Folder not found for id " + id));
    }
}
