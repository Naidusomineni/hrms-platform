import apiClient from './apiClient'
import type { ApiResponse, Page, PaginationParams, SupportTicket, TicketComment } from '../types'

export const helpdeskAPI = {
  createTicket: (data: Partial<SupportTicket>) =>
    apiClient.post<ApiResponse<SupportTicket>>('/v1/helpdesk/tickets', data),

  getAllTickets: (params?: PaginationParams & { status?: string }) =>
    apiClient.get<ApiResponse<Page<SupportTicket>>>('/v1/helpdesk/tickets', { params }),

  getMyTickets: (employeeId: number | string, params?: PaginationParams) =>
    apiClient.get<ApiResponse<Page<SupportTicket>>>('/v1/helpdesk/tickets/my', { params: { employeeId, ...params } }),

  getTicketById: (id: number | string) =>
    apiClient.get<ApiResponse<SupportTicket>>(`/v1/helpdesk/tickets/${id}`),

  updateTicket: (id: number | string, data: Partial<SupportTicket>) =>
    apiClient.put<ApiResponse<SupportTicket>>(`/v1/helpdesk/tickets/${id}`, data),

  addComment: (id: number | string, data: { commentText: string; isInternal?: boolean }) =>
    apiClient.post<ApiResponse<TicketComment>>(`/v1/helpdesk/tickets/${id}/comments`, data),

  getStats: () =>
    apiClient.get<ApiResponse<{ totalOpen: number; inProgress: number; resolved: number; criticalCount: number }>>('/v1/helpdesk/tickets/stats'),
}

