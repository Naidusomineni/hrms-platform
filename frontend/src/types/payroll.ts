export type PayrollStatus = 'DRAFT' | 'PROCESSED' | 'APPROVED' | 'PAID';

export interface PayrollSlip {
  id: number;
  employeeId: number;
  employeeName?: string;
  employeeNumber?: string;
  designation?: string;
  departmentName?: string;
  panNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  month: number;
  year: number;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  grossSalary: number;
  pfDeduction: number;
  professionalTax: number;
  incomeTax: number;
  totalDeductions: number;
  bonus?: number;
  overtimeAmount?: number;
  reimbursements?: number;
  deductionsAdjustment?: number;
  netSalary: number;
  status: PayrollStatus;
  processedAt?: string;
  paidAt?: string;
}

export interface PayrollSummary {
  totalCount: number;
  draftCount: number;
  draftNet: number;
  approvedCount: number;
  approvedNet: number;
  paidCount: number;
  paidNet: number;
  totalNet: number;
}
