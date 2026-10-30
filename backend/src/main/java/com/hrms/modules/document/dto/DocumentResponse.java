package com.hrms.modules.document.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DocumentResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String category;
    private String title;
    private String documentNumber;
    private String fileName;
    private Long fileSize;
    private String mimeType;
    private String downloadUrl;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String status;
    private String verifiedByName;
    private LocalDateTime verifiedAt;
    private String verificationRemarks;
    private LocalDateTime createdAt;
}
