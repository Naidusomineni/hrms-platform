import apiClient from '../../../shared/services/apiClient'

export const recruitmentService = {
  getJobs: () => apiClient.get('/v1/recruitment/jobs'),
  createJob: (data) => apiClient.post('/v1/recruitment/jobs', data),
  getCandidates: (jobId) => apiClient.get('/v1/recruitment/candidates', { params: { jobId } }),
  createCandidate: (data) => apiClient.post('/v1/recruitment/candidates', data),
  updateStage: (id, stage) => apiClient.patch(`/v1/recruitment/candidates/${id}/stage`, null, { params: { stage } }),
  addScorecard: (id, data) => apiClient.post(`/v1/recruitment/candidates/${id}/scorecards`, data),
  getScorecards: (id) => apiClient.get(`/v1/recruitment/candidates/${id}/scorecards`),
  convertToEmployee: (id, data) => apiClient.post(`/v1/recruitment/candidates/${id}/convert-to-employee`, data),
}

export default recruitmentService
