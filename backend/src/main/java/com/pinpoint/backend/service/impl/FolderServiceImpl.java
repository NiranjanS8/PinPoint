package com.pinpoint.backend.service.impl;

import com.pinpoint.backend.dto.request.CreateFolderRequest;
import com.pinpoint.backend.dto.request.UpdateFolderRequest;
import com.pinpoint.backend.dto.response.FolderResponse;
import com.pinpoint.backend.dto.response.FolderTreeNodeResponse;
import com.pinpoint.backend.entity.Folder;
import com.pinpoint.backend.entity.SavedContent;
import com.pinpoint.backend.exception.FolderNotFoundException;
import com.pinpoint.backend.exception.InvalidFolderOperationException;
import com.pinpoint.backend.repository.FolderRepository;
import com.pinpoint.backend.repository.SavedContentRepository;
import com.pinpoint.backend.service.FolderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
    public FolderResponse create(CreateFolderRequest request) {
        Folder parent = request.getParentId() == null ? null : findEntityById(request.getParentId());
        validateDuplicateSibling(parent == null ? null : parent.getId(), request.getName(), null);

        Folder folder = new Folder();
        folder.setName(cleanName(request.getName()));
        folder.setParent(parent);

        return toResponse(folderRepository.save(folder));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FolderResponse> getAll() {
        return folderRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FolderTreeNodeResponse> getTree() {
        List<Folder> folders = folderRepository.findAll();
        return buildTree(folders);
    }

    @Override
    public FolderResponse update(Long id, UpdateFolderRequest request) {
        Folder folder = findEntityById(id);
        validateDuplicateSibling(folder.getParent() == null ? null : folder.getParent().getId(), request.getName(), folder.getId());
        folder.setName(cleanName(request.getName()));
        return toResponse(folderRepository.save(folder));
    }

    @Override
    public void delete(Long id) {
        Folder folder = findEntityById(id);
        List<Folder> allFolders = folderRepository.findAll();
        Map<Long, List<Folder>> childrenByParentId = buildChildrenMap(allFolders);

        List<Folder> deletionOrder = new ArrayList<>();
        collectPostOrder(folder, childrenByParentId, deletionOrder);

        Set<Long> folderIds = deletionOrder.stream()
                .map(Folder::getId)
                .collect(LinkedHashSet::new, Set::add, Set::addAll);

        List<SavedContent> assignedContent = savedContentRepository.findAllByFolderIdIn(folderIds);
        for (SavedContent content : assignedContent) {
            content.setFolder(null);
        }
        savedContentRepository.saveAll(assignedContent);

        folderRepository.deleteAll(deletionOrder);
    }

    private Folder findEntityById(Long id) {
        return folderRepository.findById(id)
                .orElseThrow(() -> new FolderNotFoundException("Folder not found for id " + id + "."));
    }

    private void validateDuplicateSibling(Long parentId, String requestedName, Long currentFolderId) {
        String normalizedName = cleanName(requestedName);
        Folder existingFolder = (parentId == null
                ? folderRepository.findByParentIsNullAndNameIgnoreCase(normalizedName)
                : folderRepository.findByParentIdAndNameIgnoreCase(parentId, normalizedName))
                .orElse(null);

        if (existingFolder != null && !existingFolder.getId().equals(currentFolderId)) {
            throw new InvalidFolderOperationException("A folder with that name already exists here.");
        }
    }

    private String cleanName(String name) {
        if (name == null || name.isBlank()) {
            throw new InvalidFolderOperationException("Folder name is required.");
        }
        return name.trim();
    }

    private Map<Long, List<Folder>> buildChildrenMap(List<Folder> folders) {
        Map<Long, List<Folder>> childrenByParentId = new LinkedHashMap<>();
        for (Folder folder : folders) {
            Long parentId = folder.getParent() == null ? null : folder.getParent().getId();
            childrenByParentId.computeIfAbsent(parentId, ignored -> new ArrayList<>()).add(folder);
        }
        childrenByParentId.values().forEach(children -> children.sort((first, second) -> first.getName().compareToIgnoreCase(second.getName())));
        return childrenByParentId;
    }

    private void collectPostOrder(Folder folder, Map<Long, List<Folder>> childrenByParentId, List<Folder> deletionOrder) {
        for (Folder child : childrenByParentId.getOrDefault(folder.getId(), List.of())) {
            collectPostOrder(child, childrenByParentId, deletionOrder);
        }
        deletionOrder.add(folder);
    }

    private List<FolderTreeNodeResponse> buildTree(List<Folder> folders) {
        Map<Long, FolderTreeNodeResponse> nodesById = new LinkedHashMap<>();
        for (Folder folder : folders) {
            FolderTreeNodeResponse node = new FolderTreeNodeResponse();
            node.setId(folder.getId());
            node.setName(folder.getName());
            node.setParentId(folder.getParent() == null ? null : folder.getParent().getId());
            nodesById.put(folder.getId(), node);
        }

        List<FolderTreeNodeResponse> roots = new ArrayList<>();
        for (Folder folder : folders) {
            FolderTreeNodeResponse node = nodesById.get(folder.getId());
            if (folder.getParent() == null) {
                roots.add(node);
                continue;
            }

            FolderTreeNodeResponse parentNode = nodesById.get(folder.getParent().getId());
            if (parentNode == null) {
                throw new InvalidFolderOperationException("Folder hierarchy is invalid.");
            }
            parentNode.getChildren().add(node);
        }

        sortNodes(roots);
        return roots;
    }

    private void sortNodes(List<FolderTreeNodeResponse> nodes) {
        nodes.sort((first, second) -> first.getName().compareToIgnoreCase(second.getName()));
        for (FolderTreeNodeResponse node : nodes) {
            sortNodes(node.getChildren());
        }
    }

    private FolderResponse toResponse(Folder folder) {
        FolderResponse response = new FolderResponse();
        response.setId(folder.getId());
        response.setName(folder.getName());
        response.setParentId(folder.getParent() == null ? null : folder.getParent().getId());
        response.setCreatedAt(folder.getCreatedAt());
        response.setUpdatedAt(folder.getUpdatedAt());
        return response;
    }
}
