package com.pinpoint.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pinpoint.backend.dto.FolderRequest;
import com.pinpoint.backend.dto.FolderResponse;
import com.pinpoint.backend.dto.FolderTreeResponse;
import com.pinpoint.backend.dto.UpdateFolderRequest;
import com.pinpoint.backend.service.FolderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/folders")
@Validated
public class FolderController {

    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    @PostMapping
    public ResponseEntity<FolderResponse> createFolder(@Valid @RequestBody FolderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(folderService.createFolder(request));
    }

    @GetMapping
    public ResponseEntity<List<FolderResponse>> getAllFolders() {
        return ResponseEntity.ok(folderService.getAllFolders());
    }

    @GetMapping("/tree")
    public ResponseEntity<List<FolderTreeResponse>> getFolderTree() {
        return ResponseEntity.ok(folderService.getFolderTree());
    }

    @PutMapping("/{id}")
    public ResponseEntity<FolderResponse> updateFolder(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFolderRequest request
    ) {
        return ResponseEntity.ok(folderService.updateFolder(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        folderService.deleteFolder(id);
        return ResponseEntity.noContent().build();
    }
}
