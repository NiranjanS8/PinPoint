package com.pinpoint.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddContentRequest {

    @NotBlank(message = "URL is required")
    private String url;
}
