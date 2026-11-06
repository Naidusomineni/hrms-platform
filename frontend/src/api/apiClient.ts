import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '../types'

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export interface CustomAxiosError extends AxiosError {
  userFriendlyMessage?: string
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach JWT token and Multi-Tenant Context to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isGuestEndpoint = config.url && (config.url.includes('/guest/') || config.url.includes('/public/'))
    if (!isGuestEndpoint) {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } else {
      // Never attach stale employee/admin JWT to public candidate guest endpoints
      delete config.headers['Authorization']
    }

    const tenantId = localStorage.getItem('tenant_id') || 'default'
    config.headers['X-Tenant-ID'] = tenantId

    return config
  },
  (error) => Promise.reject(error)
)

// Handle errors & unauthorized token refresh
apiClient.interceptors.response.use(
  (response) => response,

  (error: CustomAxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined

    // Extract detailed friendly error message if available
    if (error.response?.data) {
      const d = error.response.data as any
      let msg = d.message || d.error || 'Request failed'
      if (d.data && typeof d.data === 'object' && !Array.isArray(d.data)) {
        const details = Object.entries(d.data)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
        if (details) msg = `${msg} (${details})`
      }
      error.userFriendlyMessage = msg
    }

    // Do NOT redirect or clear storage for public guest candidate endpoints
    const isGuestEndpoint = originalRequest?.url && (originalRequest.url.includes('/guest/') || originalRequest.url.includes('/public/'))
    if (isGuestEndpoint) {
      return Promise.reject(error)
    }

    // If unauthorized and not already retried, try refresh once
    const isLoginEndpoint = originalRequest?.url?.includes('/v1/auth/login')
    if (error.response?.status === 401 && !originalRequest?._retry && !isLoginEndpoint && originalRequest) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      return apiClient.post<ApiResponse<{ accessToken: string; refreshToken?: string }>>(
        '/v1/auth/refresh',
        refreshToken ? { refreshToken } : {}
      )
        .then(res => {
          const data = res.data?.data  
          if (data?.accessToken) {
            localStorage.setItem('accessToken', data.accessToken)
            if (data.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken)
            }
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
            originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`
            return apiClient(originalRequest)
          }
          throw new Error('Missing accessToken in refresh response')
        })
        .catch(() => {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('hrms_user')
          window.location.href = '/login'
          return Promise.reject(error)
        })
    }

    return Promise.reject(error)
  }
)

export default apiClient

