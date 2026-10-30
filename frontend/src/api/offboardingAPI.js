import apiClient from './apiClient'

export const offboardingAPI = {
  submitSeparation:      (data)                     => apiClient.post('/v1/offboarding/separations', data),
  getSeparations:        (params)                   => apiClient.get('/v1/offboarding/separations', { params }),
  getSeparationById:     (id)                       => apiClient.get(`/v1/offboarding/separations/${id}`),
  getMySeparation:       (empId)                    => apiClient.get('/v1/offboarding/separations/my', { params: { employeeId: empId } }),
  reviewSeparation:      (id, action, lwd, comments) =>
    apiClient.put(`/v1/offboarding/separations/${id}/review`, null, {
      params: { action, approvedLwd: lwd, comments }
    }),
  updateClearance:       (id, status, dues, remarks) =>
    apiClient.put(`/v1/offboarding/clearances/${id}`, null, {
      params: { status, pendingDues: dues, remarks }
    }),
  calculateSettlement:   (separationId)             => apiClient.post('/v1/offboarding/settlements/calculate', null, { params: { separationId } }),
  saveSettlement:        (data, disburse = false)   => apiClient.post('/v1/offboarding/settlements', data, { params: { disburse } }),
  getSettlement:         (separationId)             => apiClient.get(`/v1/offboarding/settlements/separation/${separationId}`),
}
