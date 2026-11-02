package com.hrms.modules.intelligence.service;

import com.hrms.modules.intelligence.dto.*;
import com.hrms.modules.intelligence.entity.HrPolicyArticle;

import java.util.List;

public interface WorkforceIntelligenceService {

    AiAssistantResponse askAssistant(AiAssistantQueryRequest request);

    List<FlightRiskAnalysisDto> evaluateTenantFlightRisks();

    List<FlightRiskAnalysisDto> getCachedFlightRiskEvaluations();

    List<DepartmentFlightRiskSummaryDto> getDepartmentRiskOverview();

    ResumeMatchResultDto evaluateCandidateMatch(ResumeMatchRequest request);

    List<HrPolicyArticle> getActivePolicies(String category);
}
