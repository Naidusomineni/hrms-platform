import apiClient from './apiClient'

export const helpdeskAPI = {
  createTicket: (data) => apiClient.post('/v1/helpdesk/tickets', data),
  getAllTickets: (params) => apiClient.get('/v1/helpdesk/tickets', { params }),
  getMyTickets: (employeeId, params) => apiClient.get('/v1/helpdesk/tickets/my', { params: { employeeId, ...params } }),
  getTicketById: (id) => apiClient.get(`/v1/helpdesk/tickets/${id}`),
  updateTicket: (id, data) => apiClient.put(`/v1/helpdesk/tickets/${id}`, data),
  addComment: (id, data) => apiClient.post(`/v1/helpdesk/tickets/${id}/comments`, data),
  getStats: () => apiClient.get('/v1/helpdesk/tickets/stats'),
}
