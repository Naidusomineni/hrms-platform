import apiClient from './apiClient'

export const payrollAPI = {
  process:    (empId, month, year) => apiClient.post('/v1/payroll/process', null, { params: { employeeId: empId, month, year } }),
  getForEmp:  (empId, params)      => apiClient.get(`/v1/payroll/employee/${empId}`, { params }),
  getSlip:    (empId, month, year) => apiClient.get(`/v1/payroll/employee/${empId}/slip`, { params: { month, year } }),
}
