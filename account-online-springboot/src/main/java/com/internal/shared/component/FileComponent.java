package com.internal.shared.component;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
@Slf4j
public class FileComponent {

    /**
     * Creates folders if they don't already exist.
     */
    public void createDirectory(String dirPath) {
        try {
            Path path = Paths.get(dirPath);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                log.info("Created directory: {}", dirPath);
            }
        } catch (IOException e) {
            log.error("Failed to create directory: {}", dirPath, e);
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    /**
     * Writes byte array to the specified file path.
     */
    public void writeBytes(String filePath, byte[] bytes) {
        try {
            Path path = Paths.get(filePath);
            Files.write(path, bytes);
            log.info("Successfully wrote bytes to file: {}", filePath);
        } catch (IOException e) {
            log.error("Failed to write bytes to file: {}", filePath, e);
            throw new RuntimeException("Could not write file content", e);
        }
    }

    /**
     * Reads all bytes from the specified file path.
     */
    public byte[] readBytes(String filePath) {
        try {
            Path path = Paths.get(filePath);
            return Files.readAllBytes(path);
        } catch (IOException e) {
            log.error("Failed to read bytes from file: {}", filePath, e);
            throw new RuntimeException("Could not read file content", e);
        }
    }
}
