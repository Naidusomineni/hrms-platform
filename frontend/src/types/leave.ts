export type LeaveType =
  | 'ANNUAL'
  | 'SICK'
  | 'CASUAL'
  | 'MATERNITY'
  | 'PATERNITY'
  | 'UNPAID'
  | 'COMPENSATORY'
  | 'EMERGENCY'
  | 'BEREAVEMENT';

export type LeaveStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'RECALLED';

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeNumber?: string;
  departmentName?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: LeaveStatus;
  approverComments?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  appliedAt?: string;
}

export interface LeaveBalance {
  id: number;
  employeeId: number;
  leaveType: LeaveType;
  allocatedDays: number;
  usedDays: number;
  pendingDays: number;
  balanceDays: number;
  year: number;
}

export interface LeaveApplicationPayload {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  employeeId?: number;
}

export interface LeaveReviewPayload {
  action: 'APPROVED' | 'REJECTED';
  comments?: string;
}
