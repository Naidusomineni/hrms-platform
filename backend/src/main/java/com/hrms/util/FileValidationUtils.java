package com.hrms.util;

import com.hrms.exception.BadRequestException;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Set;

public final class FileValidationUtils {

    public static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5 MB
    public static final long MAX_DOC_SIZE   = 15 * 1024 * 1024;  // 15 MB
    public static final long MAX_CSV_SIZE   = 10 * 1024 * 1024;  // 10 MB

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private static final Set<String> ALLOWED_DOC_EXTENSIONS = Set.of(
            "pdf", "docx", "doc", "xlsx", "xls", "png", "jpg", "jpeg", "txt", "csv");
    private static final Set<String> ALLOWED_CSV_EXTENSIONS = Set.of("csv");

    private FileValidationUtils() {}

    public static void validateImageFile(MultipartFile file, String fieldName) {
        validateCommon(file, fieldName, MAX_IMAGE_SIZE, ALLOWED_IMAGE_EXTENSIONS);
        byte[] header = readHeader(file, 16);
        if (isExecutable(header)) {
            throw new BadRequestException("Executable binaries are strictly prohibited.");
        }
        if (!isJpeg(header) && !isPng(header) && !isWebp(header)) {
            throw new BadRequestException("Uploaded " + fieldName + " does not match valid JPEG, PNG, or WEBP binary signatures.");
        }
    }

    public static void validateDocumentFile(MultipartFile file, String fieldName) {
        validateCommon(file, fieldName, MAX_DOC_SIZE, ALLOWED_DOC_EXTENSIONS);
        byte[] header = readHeader(file, 32);
        if (isExecutable(header)) {
            throw new BadRequestException("Executable binaries are strictly prohibited.");
        }

        String ext = getFileExtension(file.getOriginalFilename());
        if ("pdf".equals(ext) && !isPdf(header)) {
            throw new BadRequestException("Uploaded file does not match a valid PDF magic byte signature (%PDF-).");
        }
        if (("png".equals(ext) || "jpg".equals(ext) || "jpeg".equals(ext)) && (!isPng(header) && !isJpeg(header))) {
            throw new BadRequestException("Uploaded image document does not match a valid image binary signature.");
        }
        if (("docx".equals(ext) || "xlsx".equals(ext)) && !isZip(header)) {
            throw new BadRequestException("Uploaded Office document does not match a valid OpenXML package signature.");
        }
        if (("csv".equals(ext) || "txt".equals(ext)) && hasBinaryNullBytes(header)) {
            throw new BadRequestException("Uploaded text/CSV file contains prohibited binary control characters.");
        }
    }

    public static void validateCsvFile(MultipartFile file, String fieldName) {
        validateCommon(file, fieldName, MAX_CSV_SIZE, ALLOWED_CSV_EXTENSIONS);
        byte[] header = readHeader(file, 64);
        if (isExecutable(header) || hasBinaryNullBytes(header)) {
            throw new BadRequestException("Uploaded file is not a valid text-based CSV file.");
        }
    }

    private static void validateCommon(MultipartFile file, String fieldName, long maxSize, Set<String> allowedExts) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a valid " + fieldName + " to upload (file cannot be empty).");
        }
        if (file.getSize() > maxSize) {
            long maxMb = maxSize / (1024 * 1024);
            throw new BadRequestException("Uploaded file exceeds the maximum allowed size of " + maxMb + "MB.");
        }

        String filename = file.getOriginalFilename();
        if (!StringUtils.hasText(filename)) {
            throw new BadRequestException("Filename cannot be blank.");
        }
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\") || filename.contains("\0")) {
            throw new BadRequestException("Filename contains invalid or malicious path traversal sequences.");
        }

        String ext = getFileExtension(filename);
        if (!allowedExts.contains(ext)) {
            throw new BadRequestException("File extension ." + ext + " is not permitted for " + fieldName + ".");
        }
    }

    public static String getFileExtension(String filename) {
        if (!StringUtils.hasText(filename)) return "";
        int dot = filename.lastIndexOf('.');
        return (dot > 0 && dot < filename.length() - 1) ? filename.substring(dot + 1).toLowerCase(Locale.ROOT).trim() : "";
    }

    private static byte[] readHeader(MultipartFile file, int maxBytes) {
        try (InputStream is = file.getInputStream()) {
            byte[] buffer = new byte[maxBytes];
            int read = is.read(buffer, 0, maxBytes);
            if (read < 0) return new byte[0];
            if (read < maxBytes) {
                return java.util.Arrays.copyOf(buffer, read);
            }
            return buffer;
        } catch (IOException e) {
            throw new BadRequestException("Failed to inspect file stream: " + e.getMessage());
        }
    }

    private static boolean isPdf(byte[] b) {
        return b.length >= 5 && b[0] == 0x25 && b[1] == 0x50 && b[2] == 0x44 && b[3] == 0x46 && b[4] == 0x2D; // %PDF-
    }

    private static boolean isPng(byte[] b) {
        return b.length >= 8 &&
                (b[0] & 0xFF) == 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47 &&
                b[4] == 0x0D && b[5] == 0x0A && b[6] == 0x1A && b[7] == 0x0A;
    }

    private static boolean isJpeg(byte[] b) {
        return b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF;
    }

    private static boolean isWebp(byte[] b) {
        if (b.length < 12) return false;
        boolean isRiff = b[0] == 0x52 && b[1] == 0x49 && b[2] == 0x46 && b[3] == 0x46; // RIFF
        boolean isWebp = b[8] == 0x57 && b[9] == 0x45 && b[10] == 0x42 && b[11] == 0x50; // WEBP
        return isRiff && isWebp;
    }

    private static boolean isZip(byte[] b) {
        return b.length >= 4 && b[0] == 0x50 && b[1] == 0x4B && (b[2] == 0x03 || b[2] == 0x05) && (b[3] == 0x04 || b[3] == 0x06); // PK..
    }

    private static boolean isExecutable(byte[] b) {
        if (b.length >= 2 && b[0] == 0x4D && b[1] == 0x5A) return true; // Windows MZ PE
        if (b.length >= 4 && (b[0] & 0xFF) == 0x7F && b[1] == 0x45 && b[2] == 0x4C && b[3] == 0x46) return true; // Linux ELF
        if (b.length >= 4 && (b[0] & 0xFF) == 0xCA && (b[1] & 0xFF) == 0xFE && (b[2] & 0xFF) == 0xBA && (b[3] & 0xFF) == 0xBE) return true; // Java Class
        return false;
    }

    private static boolean hasBinaryNullBytes(byte[] b) {
        for (byte val : b) {
            if (val == 0x00) return true; // Null byte indicates raw binary or shellcode
        }
        return false;
    }
}

