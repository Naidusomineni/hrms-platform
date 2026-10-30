import apiClient from './apiClient'

export const notificationAPI = {
  getForUser:     (userId, params) => apiClient.get(`/v1/notifications/user/${userId}`, { params }),
  getUnreadCount: (userId)         => apiClient.get(`/v1/notifications/user/${userId}/unread-count`),
  markAllRead:    (userId)         => apiClient.put(`/v1/notifications/user/${userId}/mark-all-read`),
  markRead:       (id)             => apiClient.put(`/v1/notifications/${id}/read`),
}
