import { adminAPI } from '../../../api/adminAPI'
import apiClient from '../../../api/apiClient'

export const tenantService = {
  ...adminAPI,

  // Tenant Branding & White-Labeling
  getCurrentTenant: () => apiClient.get('/v1/tenants/current'),
  updateBranding: (data) => apiClient.put('/v1/tenants/current/branding', data),
  uploadLogo: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/v1/tenants/current/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

export default tenantService
