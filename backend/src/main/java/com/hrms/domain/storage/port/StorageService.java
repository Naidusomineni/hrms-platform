package com.hrms.domain.storage.port;

import java.io.InputStream;

/**
 * Universal Storage Service Port.
 * Enforces strict tenant directory and bucket isolation for cloud & local storage.
 */
public interface StorageService {

    /**
     * Uploads an object into a tenant-isolated storage path.
     *
     * @param tenantId    Identifier of the tenant owning the object
     * @param directory   Sub-directory category (e.g., "resumes", "avatars", "documents")
     * @param filename    Original or sanitized filename
     * @param inputStream File content stream
     * @param contentType MIME type of the file
     * @param size        Content length in bytes
     * @return Path or URL to the stored object
     */
    String uploadFile(String tenantId, String directory, String filename, InputStream inputStream, String contentType, long size);

    /**
     * Downloads an object belonging to a tenant.
     *
     * @param tenantId    Tenant identifier for access validation
     * @param storagePath Full relative storage path of the object
     * @return Input stream of object bytes
     */
    InputStream downloadFile(String tenantId, String storagePath);

    /**
     * Deletes an object belonging to a tenant.
     *
     * @param tenantId    Tenant identifier
     * @param storagePath Storage path
     * @return True if deleted successfully
     */
    boolean deleteFile(String tenantId, String storagePath);
}
