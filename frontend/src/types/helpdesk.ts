export type TicketCategory =
  | 'HARDWARE'
  | 'SOFTWARE'
  | 'ACCESS_VPN'
  | 'PAYROLL_QUERY'
  | 'HR_POLICY'
  | 'FACILITY';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_ON_EMPLOYEE'
  | 'RESOLVED'
  | 'CLOSED';

export interface TicketComment {
  id: number;
  authorId: number;
  authorName: string;
  commentText: string;
  isInternal: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: number;
  ticketNumber: string;
  employeeId: number;
  employeeName: string;
  departmentName?: string;
  assetId?: number;
  assetTag?: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  title: string;
  description: string;
  assignedToUserId?: number;
  assignedToName?: string;
  slaDeadline?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  comments?: TicketComment[];
}

