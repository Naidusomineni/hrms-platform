import apiClient from './apiClient'

export const departmentAPI = {
  getAll:  ()       => apiClient.get('/v1/departments'),
  getById: (id)     => apiClient.get(`/v1/departments/${id}`),
  create:  (data)   => apiClient.post('/v1/departments', data),
  update:  (id, d)  => apiClient.put(`/v1/departments/${id}`, d),
  delete:  (id)     => apiClient.delete(`/v1/departments/${id}`),
  assign:  (dId,eId)=> apiClient.post(`/v1/departments/${dId}/employees/${eId}`),
}
