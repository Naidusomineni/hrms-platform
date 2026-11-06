export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  location?: string;
  budget?: number;
  isActive: boolean;
}

export interface Employee {
  id: number;
  userId?: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  designation: string;
  jobTitle?: string;
  dateOfJoining?: string;
  dateOfLeaving?: string;
  employmentStatus: 'PROBATION' | 'ACTIVE' | 'RESIGNED' | 'TERMINATED' | 'ON_LEAVE' | 'INACTIVE' | 'NOTICE_PERIOD';
  shiftType?: string;
  salary?: number;
  panNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  departmentId?: number;
  departmentName?: string;
  managerId?: number;
  managerName?: string;
  leaveBalance?: number;
  sickLeaveBalance?: number;
  casualLeaveBalance?: number;
  profilePictureUrl?: string;
  resumeUrl?: string;
  createdAt?: string;
}

