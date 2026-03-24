package com.pinpoint.backend;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PinpointBackendApplication {

    public static void main(String[] args) throws IOException {
        Files.createDirectories(defaultDatabaseDirectory());
        SpringApplication.run(PinpointBackendApplication.class, args);
    }

    private static Path defaultDatabaseDirectory() {
        return Path.of(System.getProperty("user.home"), ".pinpoint");
    }
}
