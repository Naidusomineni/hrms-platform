export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'ON_LEAVE'
  | 'HALF_DAY'
  | 'WORK_FROM_HOME'
  | 'HOLIDAY'
  | 'LATE_ARRIVAL';

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName?: string;
  employeeNumber?: string;
  departmentName?: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number;
  overtimeHours?: number;
  totalWorkMinutes?: number;
  totalBreakMinutes?: number;
  breakMinutes?: number;
  status: AttendanceStatus;
  isOnBreak?: boolean;
  latitude?: number;
  longitude?: number;
  isGeofenceCompliant?: boolean;
  geofenceStatus?: string;
  workMode?: string;
  punchSource?: string;
  remarks?: string;
  lateArrivalReason?: string;
  regularizationStatus?: string;
}

export interface TodayAttendanceStatus {
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalWorkMinutes?: number;
  totalBreakMinutes?: number;
  status?: AttendanceStatus;
  isOnBreak?: boolean;
  workMode?: string;
  breakMinutes?: number;
}
