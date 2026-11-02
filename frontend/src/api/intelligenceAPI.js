import apiClient from './apiClient'

export const intelligenceAPI = {
  askAssistant: (query, categoryHint) =>
    apiClient.post('/v1/intelligence/assistant/ask', { query, categoryHint }),

  getPolicies: (category) =>
    apiClient.get('/v1/intelligence/policies', { params: category ? { category } : {} }),

  getAttritionRiskAnalysis: () =>
    apiClient.get('/v1/intelligence/attrition/risk-analysis'),

  reEvaluateAttritionRisk: () =>
    apiClient.post('/v1/intelligence/attrition/re-evaluate'),

  getDepartmentRiskOverview: () =>
    apiClient.get('/v1/intelligence/attrition/department-overview'),

  evaluateCandidateMatch: (jobPostingId, candidateId) =>
    apiClient.post('/v1/intelligence/ats/evaluate-candidate', { jobPostingId, candidateId }),
}
