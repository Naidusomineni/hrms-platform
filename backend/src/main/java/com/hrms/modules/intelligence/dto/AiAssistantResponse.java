package com.hrms.modules.intelligence.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAssistantResponse {

    private String query;
    private String answer;
    private String matchedArticleTitle;
    private String category;
    private String actionLabel;
    private String actionRoute;
    private Double confidenceScore;
    private List<String> relatedQuestions;
    private boolean foundDirectMatch;
}
