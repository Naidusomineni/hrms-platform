import apiClient from '../../../shared/services/apiClient'

export const reportService = {
  getAnalytics: () => apiClient.get('/v1/reports/analytics'),
  getTaxDeclarations: (empId) => apiClient.get(`/v1/reports/tax/employee/${empId}`),
  saveTaxDeclaration: (data) => apiClient.post('/v1/reports/tax', data),
}

export default reportService
