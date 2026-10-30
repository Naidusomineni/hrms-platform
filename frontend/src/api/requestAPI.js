import apiClient from './apiClient'

export const requestAPI = {
  create: (data) => apiClient.post('/v1/requests', data),
  getForEmployee: (empId, page = 0, size = 10) =>
    apiClient.get(`/v1/requests/employee/${empId}?page=${page}&size=${size}`),
  getPending: (page = 0, size = 10) =>
    apiClient.get(`/v1/requests/pending?page=${page}&size=${size}`),
  review: (id, action, comments = '') =>
    apiClient.put(`/v1/requests/${id}/review?action=${action}&comments=${encodeURIComponent(comments)}`),
}
