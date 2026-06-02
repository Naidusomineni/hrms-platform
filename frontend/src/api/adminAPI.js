import apiClient from './apiClient'

export const adminAPI = {
  getUsers: (params) => apiClient.get('/v1/admin/users', { params }),
  updateStatus: (userId, isActive) => apiClient.patch(`/v1/admin/users/${userId}/status`, { isActive }),
  updateRole: (userId, role) => apiClient.patch(`/v1/admin/users/${userId}/role`, { role }),
  getAuditLogs: (params) => apiClient.get('/v1/admin/audit', { params }),
  getSettings: () => apiClient.get('/v1/admin/settings'),
  updateSetting: (key, value) => apiClient.put(`/v1/admin/settings/${key}`, { value }),
}
