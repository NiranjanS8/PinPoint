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

import com.pinpoint.backend.dto.AddContentRequest;
import com.pinpoint.backend.dto.SavedContentResponse;
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
    public ResponseEntity<List<SavedContentResponse>> getAllContent() {
        return ResponseEntity.ok(contentService.getAllContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SavedContentResponse> getContentById(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.getContentById(id));
    }

    @PutMapping("/{id}/pin")
    public ResponseEntity<SavedContentResponse> togglePinned(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.togglePinned(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        contentService.deleteContent(id);
        return ResponseEntity.noContent().build();
    }
}
