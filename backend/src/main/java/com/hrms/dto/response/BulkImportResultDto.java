package com.hrms.dto.response;

import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BulkImportResultDto {
    private int totalRows;
    private int successCount;
    private int failureCount;
    @Builder.Default
    private List<String> errors = new ArrayList<>();
    @Builder.Default
    private List<String> importedEmployeeNumbers = new ArrayList<>();
}
