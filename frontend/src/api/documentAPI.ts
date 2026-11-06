import apiClient from './apiClient'
import type { ApiResponse, Page, DocumentResponse, HrLetterRequest } from '../types'

export const documentAPI = {
  upload: (formData: FormData) =>
    apiClient.post<ApiResponse<DocumentResponse>>('/v1/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  getForEmployee: (empId: number | string, page = 0, size = 50) =>
    apiClient.get<ApiResponse<Page<DocumentResponse>>>(`/v1/documents/employee/${empId}?page=${page}&size=${size}`),

  getPending: (page = 0, size = 10) =>
    apiClient.get<ApiResponse<Page<DocumentResponse>>>(`/v1/documents/pending-verification?page=${page}&size=${size}`),

  verify: (docId: number | string, data: { status: string; remarks?: string }) =>
    apiClient.put<ApiResponse<DocumentResponse>>(`/v1/documents/${docId}/verify`, data),

  acknowledgePolicy: (docId: number | string, empId: number | string) =>
    apiClient.post<ApiResponse<string>>(`/v1/documents/${docId}/acknowledge?employeeId=${empId}`),

  generateLetter: (data: HrLetterRequest) =>
    apiClient.post<ApiResponse<DocumentResponse>>('/v1/documents/letters/generate', data),
}

export default documentAPI

