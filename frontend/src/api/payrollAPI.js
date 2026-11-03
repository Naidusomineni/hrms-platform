import apiClient from './apiClient'

export const payrollAPI = {
  // Batch & Single Calculation (Created in DRAFT state)
  process:           (empId, month, year) => apiClient.post('/v1/payroll/process', null, { params: { employeeId: empId, month, year } }),
  processAll:        (month, year)        => apiClient.post('/v1/payroll/process-all', null, { params: { month, year } }),

  // HR Register, Summaries & Queries
  getPayrollRegister:(params)             => apiClient.get('/v1/payroll/register', { params }),
  getPayrollSummary: (month, year)        => apiClient.get('/v1/payroll/summary', { params: { month, year } }),

  // HR Review & Adjustments
  adjustPayroll:     (id, data)           => apiClient.put(`/v1/payroll/${id}/adjust`, data),
  approvePayroll:    (id)                 => apiClient.post(`/v1/payroll/${id}/approve`),
  approveAllPayroll: (month, year)        => apiClient.post('/v1/payroll/approve-all', null, { params: { month, year } }),
  markPaid:          (month, year, ref)   => apiClient.post('/v1/payroll/mark-paid', null, { params: { month, year, paymentRef: ref } }),

  // Bank Disbursement
  getBankBatch:      (month, year)        => apiClient.get('/v1/payroll/bank-batch', { params: { month, year } }),
  exportBankBatchCsv:(month, year)        => apiClient.get('/v1/payroll/bank-batch-export', { params: { month, year }, responseType: 'blob' }),

  // Employee Self-Service (Filters out DRAFT slips for regular staff)
  getForEmp:         (empId, params)      => apiClient.get(`/v1/payroll/employee/${empId}`, { params }),
  getSlip:           (empId, month, year) => apiClient.get(`/v1/payroll/employee/${empId}/slip`, { params: { month, year } }),
}
