import apiClient from './apiClient'
import type { ApiResponse, Page, PaginationParams, PayrollSlip, PayrollSummary } from '../types'

export const payrollAPI = {
  // Batch & Single Calculation (Created in DRAFT state)
  process: (empId: number | string, month: number, year: number) =>
    apiClient.post<ApiResponse<PayrollSlip>>('/v1/payroll/process', null, { params: { employeeId: empId, month, year } }),

  processAll: (month: number, year: number) =>
    apiClient.post<ApiResponse<{ processedCount: number; totalNetDisbursed: number }>>('/v1/payroll/process-all', null, { params: { month, year } }),

  // HR Register, Summaries & Queries
  getPayrollRegister: (params?: PaginationParams & { month?: number; year?: number; status?: string; search?: string }) =>
    apiClient.get<ApiResponse<Page<PayrollSlip>>>('/v1/payroll/register', { params }),

  getPayrollSummary: (month: number, year: number) =>
    apiClient.get<ApiResponse<PayrollSummary>>('/v1/payroll/summary', { params: { month, year } }),

  // HR Review & Adjustments
  adjustPayroll: (id: number | string, data: any) =>
    apiClient.put<ApiResponse<PayrollSlip>>(`/v1/payroll/${id}/adjust`, data),

  approvePayroll: (id: number | string) =>
    apiClient.post<ApiResponse<PayrollSlip>>(`/v1/payroll/${id}/approve`),

  approveAllPayroll: (month: number, year: number) =>
    apiClient.post<ApiResponse<{ approvedCount: number }>>('/v1/payroll/approve-all', null, { params: { month, year } }),

  markPaid: (month: number, year: number, paymentRef: string) =>
    apiClient.post<ApiResponse<void>>('/v1/payroll/mark-paid', null, { params: { month, year, paymentRef } }),

  // Bank Disbursement
  getBankBatch: (month: number, year: number) =>
    apiClient.get<ApiResponse<any[]>>('/v1/payroll/bank-batch', { params: { month, year } }),

  exportBankBatchCsv: (month: number, year: number) =>
    apiClient.get('/v1/payroll/bank-batch-export', { params: { month, year }, responseType: 'blob' }),

  // Employee Self-Service
  getForEmp: (empId: number | string, params?: PaginationParams) =>
    apiClient.get<ApiResponse<Page<PayrollSlip>>>(`/v1/payroll/employee/${empId}`, { params }),

  getSlip: (empId: number | string, month: number, year: number) =>
    apiClient.get<ApiResponse<PayrollSlip>>(`/v1/payroll/employee/${empId}/slip`, { params: { month, year } }),
}
