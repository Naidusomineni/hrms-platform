import apiClient from './apiClient'

export const leaveAPI = {
  apply:      (empId, data) => apiClient.post(`/v1/leaves/apply/${empId}`, data),
  review:     (id, data)    => apiClient.put(`/v1/leaves/${id}/review`, data),
  cancel:     (id, empId)   => apiClient.put(`/v1/leaves/${id}/cancel/${empId}`),
  getForEmp:  (empId, p)    => apiClient.get(`/v1/leaves/employee/${empId}`, { params: p }),
  getPending: (params)      => apiClient.get('/v1/leaves/pending', { params }),
}
