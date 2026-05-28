import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('accessToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },

  (error) => Promise.reject(error)
)

// Handle unauthorized errors
apiClient.interceptors.response.use(

  (response) => response,

  (error) => {
    const originalRequest = error.config

    // If unauthorized, try refresh once and retry original request
    if (error.response?.status === 401 && !originalRequest?._retry) {
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