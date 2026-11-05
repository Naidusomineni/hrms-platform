package com.hrms.modules.intelligence.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HrPolicyRequest {

    @NotBlank(message = "Category is required")
    @Size(max = 60, message = "Category cannot exceed 60 characters")
    private String category;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    @NotBlank(message = "Summary is required")
    private String summary;

    @NotBlank(message = "Content is required")
    private String content;

    @Size(max = 500, message = "Keywords cannot exceed 500 characters")
    private String keywords;

    @Size(max = 100, message = "Action label cannot exceed 100 characters")
    private String actionLabel;

    @Size(max = 100, message = "Action route cannot exceed 100 characters")
    private String actionRoute;

    private Boolean isActive;
}

