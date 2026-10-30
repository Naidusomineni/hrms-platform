import apiClient from './apiClient'

export const attendanceAPI = {
  punch:                (data)        => apiClient.post('/v1/attendance/punch', data),
  autoLoginPunch:       (empId, mode = 'OFFICE') => apiClient.post(`/v1/attendance/auto-login-punch?employeeId=${empId}&workMode=${mode}`),
  toggleBreak:          (empId)       => apiClient.post(`/v1/attendance/break-toggle?employeeId=${empId}`),
  getTodayStatus:       (empId)       => apiClient.get(`/v1/attendance/today-status?employeeId=${empId}`),
  syncBiometric:        (punches)     => apiClient.post('/v1/attendance/biometric-sync', punches),
  uploadBiometricCsv:   (formData)    => apiClient.post('/v1/attendance/biometric-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getBiometricDevices:  ()            => apiClient.get('/v1/attendance/biometric-devices'),
  saveBiometricDevice:  (data)        => apiClient.post('/v1/attendance/biometric-devices', data),
  regularize:           (data)        => apiClient.post('/v1/attendance/regularize', data),
  reviewRegularization: (id, action, comments = '') =>
    apiClient.put(`/v1/attendance/regularize/${id}/review?action=${action}&comments=${encodeURIComponent(comments)}`),
  getOfficeLocations:   ()            => apiClient.get('/v1/attendance/office-locations'),
  saveOfficeLocation:   (data)        => apiClient.post('/v1/attendance/office-locations', data),
  mark:                 (data)        => apiClient.post('/v1/attendance', data),
  update:               (id, data)    => apiClient.put(`/v1/attendance/${id}`, data),
  getForEmp:            (id, params)  => apiClient.get(`/v1/attendance/employee/${id}`, { params }),
  getMonthly:           (id, y, m)    => apiClient.get(`/v1/attendance/employee/${id}/monthly`, { params: { year: y, month: m } }),
  getByDate:            (date)        => apiClient.get('/v1/attendance/date', { params: { date } }),
}
