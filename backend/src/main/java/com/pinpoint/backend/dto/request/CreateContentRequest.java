package com.pinpoint.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateContentRequest {

    @NotBlank(message = "YouTube URL is required.")
    private String url;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
