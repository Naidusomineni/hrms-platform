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

    if (error.response?.status === 401) {

      // Clear auth data
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('hrms_user')

      // Redirect to login
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default apiClient