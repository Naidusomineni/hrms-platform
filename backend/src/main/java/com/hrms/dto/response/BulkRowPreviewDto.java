package com.hrms.dto.response;

import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BulkRowPreviewDto {
    private int row;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String department;
    private String designation;
    private String dateOfJoining;
    private String salary;
    private String employmentStatus;
    private boolean valid;
}

