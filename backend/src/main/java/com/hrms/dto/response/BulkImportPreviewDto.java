package com.hrms.dto.response;

import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BulkImportPreviewDto {
    private int totalRows;
    private int validRowsCount;
    private int errorRowsCount;
    @Builder.Default
    private List<BulkRowErrorDto> errors = new ArrayList<>();
    @Builder.Default
    private List<BulkRowPreviewDto> previewRows = new ArrayList<>();
}
