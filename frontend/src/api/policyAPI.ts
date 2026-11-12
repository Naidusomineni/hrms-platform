import apiClient from './apiClient';
import type { ApiResponse, AttendancePolicy, PolicyAssignment, ApprovalDelegation } from '../types';

export const policyAPI = {
  // Attendance Policies
  getAllAttendancePolicies: () =>
    apiClient.get<ApiResponse<AttendancePolicy[]>>('/v1/policies/attendance'),

  getPolicyById: (id: number) =>
    apiClient.get<ApiResponse<AttendancePolicy>>(`/v1/policies/attendance/${id}`),

  createPolicy: (data: Partial<AttendancePolicy>) =>
    apiClient.post<ApiResponse<AttendancePolicy>>('/v1/policies/attendance', data),

  updatePolicy: (id: number, data: Partial<AttendancePolicy>) =>
    apiClient.put<ApiResponse<AttendancePolicy>>(`/v1/policies/attendance/${id}`, data),

  deletePolicy: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/v1/policies/attendance/${id}`),

  getEffectivePolicy: (employeeId: number, date?: string) =>
    apiClient.get<ApiResponse<AttendancePolicy>>(
      `/v1/policies/attendance/effective/${employeeId}${date ? `?date=${date}` : ''}`
    ),

  // Policy Assignments
  getAssignments: (policyType = 'ATTENDANCE') =>
    apiClient.get<ApiResponse<PolicyAssignment[]>>(`/v1/policies/assignments?policyType=${policyType}`),

  assignPolicy: (data: Partial<PolicyAssignment>) =>
    apiClient.post<ApiResponse<PolicyAssignment>>('/v1/policies/assignments', data),

  deleteAssignment: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/v1/policies/assignments/${id}`),

  // Approval Delegations
  getDelegations: () =>
    apiClient.get<ApiResponse<ApprovalDelegation[]>>('/v1/workflows/delegations'),

  createDelegation: (data: Partial<ApprovalDelegation>) =>
    apiClient.post<ApiResponse<ApprovalDelegation>>('/v1/workflows/delegations', data),

  cancelDelegation: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/v1/workflows/delegations/${id}`),
};

