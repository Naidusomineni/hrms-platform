export type ExpenseCategory =
  | 'TRAVEL'
  | 'MEALS'
  | 'FOOD_ENTERTAINMENT'
  | 'CLIENT_MEETING'
  | 'TRAINING_CERTIFICATION'
  | 'OFFICE_SUPPLIES'
  | 'FUEL'
  | 'CERTIFICATION'
  | 'INTERNET_WFH'
  | 'RELOCATION'
  | 'OTHER'
  | string;

export type ExpenseStatus =
  | 'SUBMITTED'
  | 'MANAGER_APPROVED'
  | 'FINANCE_APPROVED'
  | 'REJECTED'
  | 'DISBURSED'
  | string;

export interface ExpenseClaim {
  id: number;
  claimNumber: string;
  employeeId: number;
  employeeName?: string;
  employeeNumber?: string;
  departmentName?: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  expenseDate: string;
  description?: string;
  receiptUrl?: string;
  receiptFilename?: string;
  status: ExpenseStatus;
  managerRemarks?: string;
  managerName?: string;
  managerReviewedAt?: string;
  financeRemarks?: string;
  financeReviewerName?: string;
  financeReviewedAt?: string;
  payrollSlipId?: number;
  createdAt?: string;
  updatedAt?: string;
}
