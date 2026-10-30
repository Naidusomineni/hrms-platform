import apiClient from './apiClient'
export const dashboardAPI = {
  getAdminStats: () => apiClient.get('/v1/dashboard/admin'),
}
