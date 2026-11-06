import apiClient from './apiClient'
import type { ApiResponse, AttendanceRecord, TodayAttendanceStatus } from '../types'

export const attendanceAPI = {
  punch: (data: { employeeId: number | string; punchType: string; latitude?: number; longitude?: number; remarks?: string }) =>
    apiClient.post<ApiResponse<AttendanceRecord>>('/v1/attendance/punch', data),

  autoLoginPunch: (empId: number | string, mode = 'OFFICE') =>
    apiClient.post<ApiResponse<AttendanceRecord>>(`/v1/attendance/auto-login-punch?employeeId=${empId}&workMode=${mode}`),

  toggleBreak: (empId: number | string) =>
    apiClient.post<ApiResponse<{ isOnBreak: boolean; breakStartTime?: string }>>(`/v1/attendance/break-toggle?employeeId=${empId}`),

  getTodayStatus: (empId: number | string) =>
    apiClient.get<ApiResponse<TodayAttendanceStatus>>(`/v1/attendance/today-status?employeeId=${empId}`),

  syncBiometric: (punches: any[]) =>
    apiClient.post<ApiResponse<any>>('/v1/attendance/biometric-sync', punches),

  simulatePunch: (punch: any) =>
    apiClient.post<ApiResponse<any>>('/v1/attendance/biometric/simulate-punch', punch),

  uploadBiometricCsv: (formData: FormData) =>
    apiClient.post<ApiResponse<any>>('/v1/attendance/biometric-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  getBiometricDevices: () =>
    apiClient.get<ApiResponse<any[]>>('/v1/attendance/biometric-devices'),

  saveBiometricDevice: (data: any) =>
    apiClient.post<ApiResponse<any>>('/v1/attendance/biometric-devices', data),

  regularize: (data: any) =>
    apiClient.post<ApiResponse<any>>('/v1/attendance/regularize', data),

  reviewRegularization: (id: number | string, action: string, comments = '') =>
    apiClient.put<ApiResponse<any>>(`/v1/attendance/regularize/${id}/review?action=${action}&comments=${encodeURIComponent(comments)}`),

  getOfficeLocations: () =>
    apiClient.get<ApiResponse<any[]>>('/v1/attendance/office-locations'),

  saveOfficeLocation: (data: any) =>
    apiClient.post<ApiResponse<any>>('/v1/attendance/office-locations', data),

  mark: (data: any) =>
    apiClient.post<ApiResponse<AttendanceRecord>>('/v1/attendance', data),

  update: (id: number | string, data: any) =>
    apiClient.put<ApiResponse<AttendanceRecord>>(`/v1/attendance/${id}`, data),

  getForEmp: (id: number | string, params?: any) =>
    apiClient.get<ApiResponse<AttendanceRecord[]>>(`/v1/attendance/employee/${id}`, { params }),

  getMonthly: (id: number | string, y: number, m: number) =>
    apiClient.get<ApiResponse<AttendanceRecord[]>>(`/v1/attendance/employee/${id}/monthly`, { params: { year: y, month: m } }),

  getByDate: (date: string) =>
    apiClient.get<ApiResponse<AttendanceRecord[]>>('/v1/attendance/date', { params: { date } }),
}
