package com.pinpoint.backend.controller;

import com.pinpoint.backend.dto.request.CreateFolderRequest;
import com.pinpoint.backend.dto.request.UpdateFolderRequest;
import com.pinpoint.backend.dto.response.FolderResponse;
import com.pinpoint.backend.dto.response.FolderTreeNodeResponse;
import com.pinpoint.backend.service.FolderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FolderResponse create(@Valid @RequestBody CreateFolderRequest request) {
        return folderService.create(request);
    }

    @GetMapping
    public List<FolderResponse> getAll() {
        return folderService.getAll();
    }

    @GetMapping("/tree")
    public List<FolderTreeNodeResponse> getTree() {
        return folderService.getTree();
    }

    @PutMapping("/{id}")
    public FolderResponse update(@PathVariable Long id, @Valid @RequestBody UpdateFolderRequest request) {
        return folderService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        folderService.delete(id);
    }
}
