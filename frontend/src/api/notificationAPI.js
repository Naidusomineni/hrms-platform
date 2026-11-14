import apiClient from './apiClient'

export const notificationAPI = {
  getMyNotifications: (params) => apiClient.get('/v1/notifications', { params }),
  getUnreadCount: (userId) => userId ? apiClient.get(`/v1/notifications/user/${userId}/unread-count`) : apiClient.get('/v1/notifications/unread-count'),
  markAllRead: (userId) => userId ? apiClient.put(`/v1/notifications/user/${userId}/mark-all-read`) : apiClient.put('/v1/notifications/mark-all-read'),
  markRead: (id) => apiClient.put(`/v1/notifications/${id}/read`),
  getForUser: (userId, params) => apiClient.get(`/v1/notifications/user/${userId}`, { params }),
}
