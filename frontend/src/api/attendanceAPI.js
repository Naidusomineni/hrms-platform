import apiClient from './apiClient'

export const attendanceAPI = {
  mark:       (data)        => apiClient.post('/v1/attendance', data),
  update:     (id, data)    => apiClient.put(`/v1/attendance/${id}`, data),
  getForEmp:  (id, params)  => apiClient.get(`/v1/attendance/employee/${id}`, { params }),
  getMonthly: (id, y, m)    => apiClient.get(`/v1/attendance/employee/${id}/monthly`, { params: { year: y, month: m } }),
  getByDate:  (date)        => apiClient.get('/v1/attendance/date', { params: { date } }),
}
