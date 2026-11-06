import apiClient from './apiClient';
import { ApiResponse, PageResponse, LeaveRequest, LeaveBalance, LeaveApplicationPayload, LeaveReviewPayload } from '../types';

export const leaveAPI = {
  apply: (empId: number | string, data: LeaveApplicationPayload) =>
    apiClient.post<ApiResponse<LeaveRequest>>(`/v1/leaves/apply/${empId}`, data),

  review: (id: number | string, data: LeaveReviewPayload) =>
    apiClient.put<ApiResponse<LeaveRequest>>(`/v1/leaves/${id}/review`, data),

  cancel: (id: number | string, empId: number | string) =>
    apiClient.put<ApiResponse<void>>(`/v1/leaves/${id}/cancel/${empId}`),

  getForEmp: (empId: number | string, p?: { page?: number; size?: number }) =>
    apiClient.get<ApiResponse<PageResponse<LeaveRequest>>>(`/v1/leaves/employee/${empId}`, { params: p }),

  getPending: (params?: { page?: number; size?: number }) =>
    apiClient.get<ApiResponse<PageResponse<LeaveRequest>>>('/v1/leaves/pending', { params }),

  getPolicies: () =>
    apiClient.get<ApiResponse<unknown[]>>('/v1/leaves/policies'),

  savePolicy: (data: unknown) =>
    apiClient.post<ApiResponse<unknown>>('/v1/leaves/policies', data),

  getBalances: (empId: number | string) =>
    apiClient.get<ApiResponse<LeaveBalance[]>>(`/v1/leaves/balances/employee/${empId}`),

  triggerAccrual: () =>
    apiClient.post<ApiResponse<void>>('/v1/leaves/accrual/run'),
};
