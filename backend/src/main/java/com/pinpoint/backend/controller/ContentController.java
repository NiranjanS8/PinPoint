package com.pinpoint.backend.controller;

import com.pinpoint.backend.dto.request.CreateContentRequest;
import com.pinpoint.backend.dto.response.SavedContentResponse;
import com.pinpoint.backend.service.ContentService;
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
@RequestMapping("/api/content")
public class ContentController {

    private final ContentService contentService;

    public ContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SavedContentResponse create(@Valid @RequestBody CreateContentRequest request) {
        return contentService.create(request);
    }

    @GetMapping
    public List<SavedContentResponse> getAll() {
        return contentService.getAll();
    }

    @GetMapping("/{id}")
    public SavedContentResponse getById(@PathVariable Long id) {
        return contentService.getById(id);
    }

    @PutMapping("/{id}/pin")
    public SavedContentResponse togglePinned(@PathVariable Long id) {
        return contentService.togglePinned(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        contentService.delete(id);
    }
}
