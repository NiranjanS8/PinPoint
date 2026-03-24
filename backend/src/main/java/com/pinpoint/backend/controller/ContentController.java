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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pinpoint.backend.dto.AddContentRequest;
import com.pinpoint.backend.dto.SavedContentResponse;
import com.pinpoint.backend.dto.UpdateContentRequest;
import com.pinpoint.backend.dto.UpdateContentProgressRequest;
import com.pinpoint.backend.dto.UpdateContentFolderRequest;
import com.pinpoint.backend.entity.ContentType;
import com.pinpoint.backend.service.ContentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/content")
@Validated
public class ContentController {

    private final ContentService contentService;

    public ContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    @PostMapping
    public ResponseEntity<SavedContentResponse> addContent(@Valid @RequestBody AddContentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contentService.addContent(request));
    }

    @GetMapping
    public ResponseEntity<List<SavedContentResponse>> getAllContent(
            @RequestParam(required = false) Long folderId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Boolean pinned,
            @RequestParam(required = false) ContentType contentType
    ) {
        return ResponseEntity.ok(contentService.getAllContent(folderId, search, sort, pinned, contentType));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SavedContentResponse> getContentById(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.getContentById(id));
    }

    @GetMapping("/continue-learning")
    public ResponseEntity<List<SavedContentResponse>> getContinueLearning() {
        return ResponseEntity.ok(contentService.getContinueLearning());
    }

    @GetMapping("/recently-watched")
    public ResponseEntity<List<SavedContentResponse>> getRecentlyWatched() {
        return ResponseEntity.ok(contentService.getRecentlyWatched());
    }

    @PutMapping("/{id}/pin")
    public ResponseEntity<SavedContentResponse> togglePinned(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.togglePinned(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavedContentResponse> updateContent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateContentRequest request
    ) {
        return ResponseEntity.ok(contentService.updateContent(id, request));
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<SavedContentResponse> updatePlaybackProgress(
            @PathVariable Long id,
            @Valid @RequestBody UpdateContentProgressRequest request
    ) {
        return ResponseEntity.ok(contentService.updatePlaybackProgress(id, request));
    }

    @PutMapping("/{id}/folder")
    public ResponseEntity<SavedContentResponse> updateFolder(
            @PathVariable Long id,
            @RequestBody UpdateContentFolderRequest request
    ) {
        return ResponseEntity.ok(contentService.updateFolder(id, request.getFolderId()));
    }

    @PutMapping("/{id}/opened")
    public ResponseEntity<SavedContentResponse> markOpened(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.markOpened(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        contentService.deleteContent(id);
        return ResponseEntity.noContent().build();
    }
}
