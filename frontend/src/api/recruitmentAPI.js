import apiClient from './apiClient'

export const recruitmentAPI = {
  getJobPostings: () => apiClient.get('/v1/recruitment/jobs'),
  getCandidates: (jobId) => apiClient.get('/v1/recruitment/candidates', { params: jobId ? { jobId } : {} }),
  createCandidate: (data) => apiClient.post('/v1/recruitment/candidates', data),
  updateStage: (id, stage) => apiClient.patch(`/v1/recruitment/candidates/${id}/stage`, null, { params: { stage } }),
}

export default recruitmentAPI
