import type { Employee } from './employee';

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  newHiresThisMonth: number;
  totalDepartments: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  pendingLeaveRequests: number;
  openJobPostings: number;
  pendingReviews: number;
  employeesByDepartment?: Record<string, number>;
  attendanceThisWeek?: Record<string, number>;
  leaveTypeDistribution?: Record<string, number>;
  headcountTrend?: Record<string, number>;
  recentHires?: (Partial<Employee> & { id: number; fullName?: string; departmentName?: string })[];
  upcomingBirthdays?: { name: string; department?: string; dateOfBirth?: string }[];
}
