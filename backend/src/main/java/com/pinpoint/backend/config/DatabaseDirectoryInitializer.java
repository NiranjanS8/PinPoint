package com.pinpoint.backend.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class DatabaseDirectoryInitializer {

    @Value("${pinpoint.database.directory}")
    private String databaseDirectory;

    @PostConstruct
    void initialize() throws IOException {
        Files.createDirectories(Path.of(databaseDirectory));
    }
}
