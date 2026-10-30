import apiClient from './apiClient'

export const communicationAPI = {
  getActiveAnnouncements: () => apiClient.get('/v1/communication/announcements'),
  getAllAnnouncements: (params) => apiClient.get('/v1/communication/announcements/all', { params }),
  createAnnouncement: (data) => apiClient.post('/v1/communication/announcements', data),
  acknowledgeAnnouncement: (id) => apiClient.post(`/v1/communication/announcements/${id}/acknowledge`),
  deleteAnnouncement: (id) => apiClient.delete(`/v1/communication/announcements/${id}`),
}
