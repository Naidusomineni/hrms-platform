export type ExpenseCategory =
  | 'TRAVEL'
  | 'FOOD_ENTERTAINMENT'
  | 'CLIENT_MEETING'
  | 'TRAINING_CERTIFICATION'
  | 'OFFICE_SUPPLIES'
  | 'INTERNET_WFH'
  | 'RELOCATION'
  | 'OTHER';

export type ExpenseStatus =
  | 'SUBMITTED'
  | 'MANAGER_APPROVED'
  | 'FINANCE_APPROVED'
  | 'REJECTED'
  | 'DISBURSED';

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
  financeRemarks?: string;
  payrollSlipId?: number;
  createdAt?: string;
}
