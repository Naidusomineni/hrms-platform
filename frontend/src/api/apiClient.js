import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach JWT token and Multi-Tenant Context to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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

  (error) => {
    const originalRequest = error.config

    // Extract detailed friendly error message if available
    if (error.response?.data) {
      const d = error.response.data
      let msg = d.message || d.error || 'Request failed'
      if (d.data && typeof d.data === 'object' && !Array.isArray(d.data)) {
        const details = Object.entries(d.data)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
        if (details) msg = `${msg} (${details})`
      }
      error.userFriendlyMessage = msg
    }

    // If unauthorized and not already retried, try refresh once
    const isLoginEndpoint = originalRequest?.url?.includes('/v1/auth/login')
    if (error.response?.status === 401 && !originalRequest?._retry && !isLoginEndpoint) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        return apiClient.post('/v1/auth/refresh', { refreshToken })
          .then(res => {
            const data = res.data.data  
            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
            originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`
            return apiClient(originalRequest)
          })
          .catch(() => {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('hrms_user')
            window.location.href = '/login'
            return Promise.reject(error)
          })
      }
      // no refresh token, clear and redirect
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('hrms_user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
) 

export default apiClient