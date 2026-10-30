import apiClient from './apiClient'

export const documentAPI = {
  upload: (formData) => apiClient.post('/v1/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getForEmployee: (empId, page = 0, size = 10) =>
    apiClient.get(`/v1/documents/employee/${empId}?page=${page}&size=${size}`),
  getPending: (page = 0, size = 10) =>
    apiClient.get(`/v1/documents/pending-verification?page=${page}&size=${size}`),
  verify: (docId, data) => apiClient.put(`/v1/documents/${docId}/verify`, data),
  acknowledgePolicy: (docId, empId) =>
    apiClient.post(`/v1/documents/${docId}/acknowledge?employeeId=${empId}`),
  generateLetter: (data) => apiClient.post('/v1/documents/letters/generate', data),
}
