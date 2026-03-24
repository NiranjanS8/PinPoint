package com.pinpoint.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateFolderRequest {

    @NotBlank(message = "Folder name is required.")
    @Size(max = 120, message = "Folder name must be 120 characters or fewer.")
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
