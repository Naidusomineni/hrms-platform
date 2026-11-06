import apiClient from './apiClient'
import type { ApiResponse, Employee, Page, PaginationParams } from '../types'

export const employeeAPI = {
  getMe: () => apiClient.get<ApiResponse<Employee>>('/v1/employees/me'),
  getMyProfile: () => apiClient.get<ApiResponse<Employee>>('/v1/employees/me'),
  getAll: (params?: PaginationParams & { search?: string }) => apiClient.get<ApiResponse<Page<Employee>>>('/v1/employees', { params }),
  getById: (id: number | string) => apiClient.get<ApiResponse<Employee>>(`/v1/employees/${id}`),
  getByDept: (deptId: number | string, params?: PaginationParams) => apiClient.get<ApiResponse<Page<Employee>>>(`/v1/employees/department/${deptId}`, { params }),
  create: (data: Partial<Employee>) => apiClient.post<ApiResponse<Employee>>('/v1/employees', data),
  update: (id: number | string, data: Partial<Employee>) => apiClient.put<ApiResponse<Employee>>(`/v1/employees/${id}`, data),
  delete: (id: number | string) => apiClient.delete<ApiResponse<void>>(`/v1/employees/${id}`),
  uploadPhoto: (id?: number | string, formData?: FormData) =>
    (id ? apiClient.post<ApiResponse<Employee>>(`/v1/employees/${id}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        : apiClient.post<ApiResponse<Employee>>('/v1/employees/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } })),
  uploadDoc: (id?: number | string, formData?: FormData) =>
    (id ? apiClient.post<ApiResponse<Employee>>(`/v1/employees/${id}/document`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        : apiClient.post<ApiResponse<Employee>>('/v1/employees/document', formData, { headers: { 'Content-Type': 'multipart/form-data' } })),
}

