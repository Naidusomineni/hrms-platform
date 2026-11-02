package com.hrms.infrastructure.storage;

import com.hrms.domain.storage.port.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Local filesystem implementation of StorageService.
 * Automatically organizes files into tenant-isolated folders:
 *   {baseDir}/{tenantId}/{directory}/{uuid}_{filename}
 */
@Service
@Slf4j
@ConditionalOnProperty(name = "storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private final Path baseStoragePath;

    public LocalStorageService(@Value("${storage.local.base-dir:./storage}") String baseDir) {
        this.baseStoragePath = Paths.get(baseDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.baseStoragePath);
            log.info("Initialized local tenant storage directory at: {}", this.baseStoragePath);
        } catch (IOException e) {
            log.error("Failed to initialize storage directory: {}", e.getMessage(), e);
        }
    }

    @Override
    public String uploadFile(String tenantId, String directory, String filename, InputStream inputStream, String contentType, long size) {
        String safeTenant = (tenantId == null || tenantId.isBlank()) ? "default" : tenantId.trim().toLowerCase();
        String safeDir = (directory == null || directory.isBlank()) ? "general" : directory.trim().toLowerCase();
        String uniqueFilename = UUID.randomUUID().toString() + "_" + sanitizeFilename(filename);

        Path targetDir = baseStoragePath.resolve(safeTenant).resolve(safeDir);
        try {
            Files.createDirectories(targetDir);
            Path targetFile = targetDir.resolve(uniqueFilename);
            Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            String relativePath = safeTenant + "/" + safeDir + "/" + uniqueFilename;
            log.info("Stored file for tenant [{}]: {}", safeTenant, relativePath);
            return relativePath;
        } catch (IOException e) {
            log.error("Failed to store file for tenant [{}]: {}", safeTenant, e.getMessage(), e);
            throw new RuntimeException("Could not store file: " + e.getMessage(), e);
        }
    }

    @Override
    public InputStream downloadFile(String tenantId, String storagePath) {
        String safeTenant = (tenantId == null || tenantId.isBlank()) ? "default" : tenantId.trim().toLowerCase();
        Path file = baseStoragePath.resolve(storagePath).normalize();

        // Enforce path traversal protection and tenant isolation
        if (!file.startsWith(baseStoragePath.resolve(safeTenant))) {
            log.warn("Unauthorized access attempt: tenant [{}] tried to read outside path [{}]", safeTenant, storagePath);
            throw new SecurityException("Access to path denied across tenant boundaries");
        }

        try {
            return Files.newInputStream(file);
        } catch (IOException e) {
            throw new RuntimeException("File not found or unreadable: " + storagePath, e);
        }
    }

    @Override
    public boolean deleteFile(String tenantId, String storagePath) {
        String safeTenant = (tenantId == null || tenantId.isBlank()) ? "default" : tenantId.trim().toLowerCase();
        Path file = baseStoragePath.resolve(storagePath).normalize();

        if (!file.startsWith(baseStoragePath.resolve(safeTenant))) {
            log.warn("Unauthorized deletion attempt: tenant [{}] on path [{}]", safeTenant, storagePath);
            throw new SecurityException("Access to path denied across tenant boundaries");
        }

        try {
            return Files.deleteIfExists(file);
        } catch (IOException e) {
            log.error("Failed to delete file: {}", storagePath, e);
            return false;
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "file";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
