import apiClient from './apiClient'
import type { ApiResponse, ExpenseClaim, Page, PaginationParams } from '../types'

export const expenseAPI = {
  submitExpenseClaim: (employeeId: number | string, data: Partial<ExpenseClaim>) => 
    apiClient.post<ApiResponse<ExpenseClaim>>(`/v1/expenses/claims?employeeId=${employeeId}`, data),

  getMyExpenseClaims: (employeeId: number | string, params: PaginationParams = {}) => 
    apiClient.get<ApiResponse<Page<ExpenseClaim>>>(`/v1/expenses/claims/my?employeeId=${employeeId}`, { params }),

  getAllExpenseClaims: (params: PaginationParams & { status?: string } = {}) => 
    apiClient.get<ApiResponse<Page<ExpenseClaim>>>('/v1/expenses/claims', { params }),

  getExpenseClaimById: (id: number | string) => 
    apiClient.get<ApiResponse<ExpenseClaim>>(`/v1/expenses/claims/${id}`),

  managerReviewClaim: (id: number | string, managerEmployeeId: number | string | undefined, data: { action: string; remarks?: string }) => 
    apiClient.put<ApiResponse<ExpenseClaim>>(`/v1/expenses/claims/${id}/manager-review${managerEmployeeId ? `?managerEmployeeId=${managerEmployeeId}` : ''}`, data),

  financeReviewClaim: (id: number | string, financeEmployeeId: number | string | undefined, data: { action: string; remarks?: string }) => 
    apiClient.put<ApiResponse<ExpenseClaim>>(`/v1/expenses/claims/${id}/finance-review${financeEmployeeId ? `?financeEmployeeId=${financeEmployeeId}` : ''}`, data)
}
