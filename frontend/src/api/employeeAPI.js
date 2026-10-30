import apiClient from './apiClient'

export const employeeAPI = {
  getAll:     (params) => apiClient.get('/v1/employees', { params }),
  getById:    (id)     => apiClient.get(`/v1/employees/${id}`),
  getByDept:  (id, p)  => apiClient.get(`/v1/employees/department/${id}`, { params: p }),
  create:     (data)   => apiClient.post('/v1/employees', data),
  update:     (id, d)  => apiClient.put(`/v1/employees/${id}`, d),
  delete:     (id)     => apiClient.delete(`/v1/employees/${id}`),
  uploadPhoto:(id, fd) => apiClient.post(`/v1/employees/${id}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadDoc:  (id, fd) => apiClient.post(`/v1/employees/${id}/document`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
}
