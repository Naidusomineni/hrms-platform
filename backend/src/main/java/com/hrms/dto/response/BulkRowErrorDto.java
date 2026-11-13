package com.hrms.dto.response;

import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BulkRowErrorDto {
    private int row;
    private String field;
    private String error;
    private String value;
}
