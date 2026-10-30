import apiClient from './apiClient'

export const payrollAPI = {
  process:           (empId, month, year) => apiClient.post('/v1/payroll/process', null, { params: { employeeId: empId, month, year } }),
  processAll:        (month, year)        => apiClient.post('/v1/payroll/process-all', null, { params: { month, year } }),
  getBankBatch:      (month, year)        => apiClient.get('/v1/payroll/bank-batch', { params: { month, year } }),
  exportBankBatchCsv:(month, year)        => apiClient.get('/v1/payroll/bank-batch-export', { params: { month, year }, responseType: 'blob' }),
  getForEmp:         (empId, params)      => apiClient.get(`/v1/payroll/employee/${empId}`, { params }),
  getSlip:           (empId, month, year) => apiClient.get(`/v1/payroll/employee/${empId}/slip`, { params: { month, year } }),
}
