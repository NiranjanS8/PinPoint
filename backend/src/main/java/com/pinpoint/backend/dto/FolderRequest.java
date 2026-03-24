package com.pinpoint.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FolderRequest {

    @NotBlank(message = "Folder name is required")
    @Size(max = 255, message = "Folder name must be 255 characters or fewer")
    private String name;

    private Long parentId;
}
