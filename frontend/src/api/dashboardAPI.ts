import apiClient from './apiClient'
import type { ApiResponse, DashboardStats } from '../types'

export const dashboardAPI = {
  getAdminStats: () => apiClient.get<ApiResponse<DashboardStats>>('/v1/dashboard/admin'),
}

export default dashboardAPI
