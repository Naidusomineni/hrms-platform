import apiClient from './apiClient'

export const expenseAPI = {
  submitExpenseClaim: (employeeId, data) => 
    apiClient.post(`/v1/expenses/claims?employeeId=${employeeId}`, data),

  getMyExpenseClaims: (employeeId, params = {}) => 
    apiClient.get(`/v1/expenses/claims/my?employeeId=${employeeId}`, { params }),

  getAllExpenseClaims: (params = {}) => 
    apiClient.get('/v1/expenses/claims', { params }),

  getExpenseClaimById: (id) => 
    apiClient.get(`/v1/expenses/claims/${id}`),

  managerReviewClaim: (id, managerEmployeeId, data) => 
    apiClient.put(`/v1/expenses/claims/${id}/manager-review${managerEmployeeId ? `?managerEmployeeId=${managerEmployeeId}` : ''}`, data),

  financeReviewClaim: (id, financeEmployeeId, data) => 
    apiClient.put(`/v1/expenses/claims/${id}/finance-review${financeEmployeeId ? `?financeEmployeeId=${financeEmployeeId}` : ''}`, data)
}
