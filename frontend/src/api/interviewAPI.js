import apiClient from './apiClient'

export const interviewAPI = {
  // HR Scheduling & Management
  scheduleInterview: (data) => apiClient.post('/v1/recruitment/interviews', data),
  getAllInterviews: () => apiClient.get('/v1/recruitment/interviews'),
  getInterviewsForCandidate: (candidateId) => apiClient.get(`/v1/recruitment/interviews/candidate/${candidateId}`),
  getInterview: (id) => apiClient.get(`/v1/recruitment/interviews/${id}`),
  getInterviewerJoinToken: (id) => apiClient.get(`/v1/recruitment/interviews/${id}/join-token`),

  // Candidate Public Guest Access (No auth required)
  getCandidateGuestSession: (guestToken) => apiClient.get(`/v1/recruitment/interviews/guest/${guestToken}`),
  candidateJoinRoom: (guestToken, telemetry) => apiClient.post(`/v1/recruitment/interviews/guest/${guestToken}/join`, telemetry),
  reportTelemetry: (guestToken, telemetry) => apiClient.post(`/v1/recruitment/interviews/guest/${guestToken}/telemetry`, telemetry),

  // In-Call Live Scorecard & Finalization
  saveLiveScorecard: (id, scorecard) => apiClient.put(`/v1/recruitment/interviews/${id}/scorecard`, scorecard),
  completeInterview: (id, nextStage) => apiClient.post(`/v1/recruitment/interviews/${id}/complete`, null, { params: { nextStage } }),
  cancelInterview: (id) => apiClient.post(`/v1/recruitment/interviews/${id}/cancel`),

  // WebRTC Real-Time Signaling & In-Call Chat
  postCandidateSignal: (guestToken, signal) => apiClient.post(`/v1/recruitment/interviews/guest/${guestToken}/signal`, signal),
  getCandidateSignals: (guestToken, since = 0) => apiClient.get(`/v1/recruitment/interviews/guest/${guestToken}/signals`, { params: { since } }),
  postInterviewerSignal: (id, signal) => apiClient.post(`/v1/recruitment/interviews/${id}/signal`, signal),
  getInterviewerSignals: (id, since = 0) => apiClient.get(`/v1/recruitment/interviews/${id}/signals`, { params: { since } }),
}
