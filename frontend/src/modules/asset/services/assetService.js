import apiClient from '../../../shared/services/apiClient'

export const assetService = {
  getAssets: () => apiClient.get('/v1/assets'),
  createAsset: (data) => apiClient.post('/v1/assets', data),
  allocateAsset: (id, employeeId, notes = '') => apiClient.post(`/v1/assets/${id}/allocate?employeeId=${employeeId}&notes=${encodeURIComponent(notes)}`),
  returnAsset: (allocationId, notes = '') => apiClient.post(`/v1/assets/allocations/${allocationId}/return?notes=${encodeURIComponent(notes)}`),
  getEmployeeAssets: (empId) => apiClient.get(`/v1/assets/employee/${empId}`),
}

export default assetService
