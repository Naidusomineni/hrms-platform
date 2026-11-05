import apiClient from './apiClient'

export const intelligenceAPI = {
  askAssistant: (query, categoryHint) =>
    apiClient.post('/v1/intelligence/assistant/ask', { query, categoryHint }),

  getPolicies: (category, includeInactive = false) =>
    apiClient.get('/v1/intelligence/policies', {
      params: {
        ...(category ? { category } : {}),
        ...(includeInactive ? { includeInactive: true } : {})
      }
    }),

  getPolicyById: (id) =>
    apiClient.get(`/v1/intelligence/policies/${id}`),

  createPolicy: (data) =>
    apiClient.post('/v1/intelligence/policies', data),

  uploadPolicyDocument: (formData) =>
    apiClient.post('/v1/intelligence/policies/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  updatePolicy: (id, data) =>
    apiClient.put(`/v1/intelligence/policies/${id}`, data),

  deletePolicy: (id) =>
    apiClient.delete(`/v1/intelligence/policies/${id}`),

  getAttritionRiskAnalysis: () =>
    apiClient.get('/v1/intelligence/attrition/risk-analysis'),

  reEvaluateAttritionRisk: () =>
    apiClient.post('/v1/intelligence/attrition/re-evaluate'),

  getDepartmentRiskOverview: () =>
    apiClient.get('/v1/intelligence/attrition/department-overview'),

  evaluateCandidateMatch: (jobPostingId, candidateId) =>
    apiClient.post('/v1/intelligence/ats/evaluate-candidate', { jobPostingId, candidateId }),
}
