export type LatePenaltyAction = 'FLAG_ONLY' | 'DEDUCT_HALF_DAY' | 'DEDUCT_LEAVE' | 'LOSS_OF_PAY';

export interface AttendancePolicy {
  id: number;
  policyName: string;
  policyCode: string;
  description?: string;
  isDefault: boolean;
  effectiveFrom: string;
  shiftStartTime?: string; // e.g. "09:00:00"
  shiftEndTime?: string; // e.g. "18:00:00"
  allowedPunchMethods: string; // e.g. "BIOMETRIC,WEB,GEOFENCE"
  gracePeriodMinutes: number;
  maxLateAllowedPerMonth: number;
  latePenaltyAction: LatePenaltyAction;
  fullDayHours: number;
  halfDayHours: number;
  absentThresholdHours: number;
  earlyDepartureMinutes: number;
  earlyDeparturePenalty?: string;
  overtimeEnabled: boolean;
  minOvertimeThresholdMinutes: number;
  overtimeRequiresApproval: boolean;
  autoDeductBreak: boolean;
  breakDeductionMinutes: number;
  maxRegularizationsPerMonth: number;
  regularizationFilingWindowDays: number;
  isActive: boolean;
}

export interface PolicyAssignment {
  id: number;
  policyType: 'ATTENDANCE' | 'LEAVE';
  policyId: number;
  policyName: string;
  policyCode: string;
  departmentId?: number | null;
  departmentName?: string | null;
  officeLocationId?: number | null;
  officeLocationName?: string | null;
  employeeId?: number | null;
  employeeName?: string | null;
  priorityLevel: number; // 1: Employee, 2: Department, 3: Location, 4: Tenant Default
  createdAt: string;
}

export interface TenantModuleManifest {
  id?: number | null;
  moduleKey: string;
  isEnabled: boolean;
}

export interface ApprovalDelegation {
  id: number;
  delegatorId: number;
  delegatorName: string;
  delegateeId: number;
  delegateeName: string;
  startDate: string;
  endDate: string;
  requestTypes: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

