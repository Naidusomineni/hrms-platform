import apiClient from '../../../shared/services/apiClient'

export const performanceService = {
  getCycles: () => apiClient.get('/v1/performance/cycles'),
  createCycle: (data) => apiClient.post('/v1/performance/cycles', data),
  getGoals: (empId, cycleId) => apiClient.get(`/v1/performance/goals/employee/${empId}`, { params: { cycleId } }),
  createGoal: (data) => apiClient.post('/v1/performance/goals', data),
  updateGoalProgress: (id, progress, status) => apiClient.patch(`/v1/performance/goals/${id}/progress`, null, { params: { progress, status } }),
  getReviews: (empId) => apiClient.get(`/v1/performance/reviews/employee/${empId}`),
  submitReview: (data) => apiClient.post('/v1/performance/reviews', data),
}

export default performanceService
