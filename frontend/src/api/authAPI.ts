import apiClient from './apiClient'
import type { ApiResponse, AuthResponse, LoginCredentials } from '../types'

export const authAPI = {
  register: (data: any) => apiClient.post<ApiResponse<AuthResponse>>('/v1/auth/register', data),
  login: (data: LoginCredentials) => apiClient.post<ApiResponse<AuthResponse>>('/v1/auth/login', data),
  logout: (token: string) => apiClient.post<ApiResponse<void>>(`/v1/auth/logout?refreshToken=${token}`),
  logoutAll: () => apiClient.post<ApiResponse<void>>('/v1/auth/logout-all'),
  refresh: (data: { refreshToken: string }) => apiClient.post<ApiResponse<AuthResponse>>('/v1/auth/refresh', data),
  forgotPassword: (data: { email: string }) => apiClient.post<ApiResponse<void>>('/v1/auth/forgot-password', data),
  resetPassword: (data: any) => apiClient.post<ApiResponse<void>>('/v1/auth/reset-password', data),
  verifyEmail: (token: string, email: string) => apiClient.post<ApiResponse<void>>(`/v1/auth/verify-email?token=${token}&email=${email}`),
  resendVerification: (email: string) => apiClient.post<ApiResponse<void>>(`/v1/auth/resend-verification?email=${email}`),
  changePassword: (userId: number, data: any) => apiClient.post<ApiResponse<void>>(`/v1/auth/change-password?userId=${userId}`, data),
  getLoginHistory: (userId: number) => apiClient.get<ApiResponse<any>>(`/v1/auth/login-history?userId=${userId}`),
}

