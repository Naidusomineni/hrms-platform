import apiClient from './apiClient'

export const authAPI = {
  register:          (data)         => apiClient.post('/v1/auth/register', data),
  login:             (data)         => apiClient.post('/v1/auth/login', data),
  logout:            (token)        => apiClient.post(`/v1/auth/logout?refreshToken=${token}`),
  logoutAll:         ()             => apiClient.post('/v1/auth/logout-all'),
  refresh:           (data)         => apiClient.post('/v1/auth/refresh', data),
  forgotPassword:    (data)         => apiClient.post('/v1/auth/forgot-password', data),
  resetPassword:     (data)         => apiClient.post('/v1/auth/reset-password', data),
  verifyEmail:       (token, email) => apiClient.post(`/v1/auth/verify-email?token=${token}&email=${email}`),
  resendVerification:(email)        => apiClient.post(`/v1/auth/resend-verification?email=${email}`),
  changePassword:    (userId, data) => apiClient.post(`/v1/auth/change-password?userId=${userId}`, data),
  getLoginHistory:   (userId)       => apiClient.get(`/v1/auth/login-history?userId=${userId}`),
}
