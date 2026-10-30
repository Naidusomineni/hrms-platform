import apiClient from './apiClient'

export const workflowAPI = {
  getInbox: () => apiClient.get('/v1/workflows/inbox'),
  recordDecision: (instanceId, data) => apiClient.post(`/v1/workflows/tasks/${instanceId}/decision`, data),
  getDefinitions: () => apiClient.get('/v1/workflows/definitions'),
}
