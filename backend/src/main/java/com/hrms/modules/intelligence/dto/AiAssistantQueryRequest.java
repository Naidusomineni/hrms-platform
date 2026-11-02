package com.hrms.modules.intelligence.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAssistantQueryRequest {

    @NotBlank(message = "Query cannot be blank")
    private String query;

    private String categoryHint;
}
