export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'ON_LEAVE' | 'HALF_DAY';

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName?: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalWorkMinutes?: number;
  totalBreakMinutes?: number;
  status: AttendanceStatus;
  isOnBreak: boolean;
  latitude?: number;
  longitude?: number;
  isGeofenceCompliant?: boolean;
}

export interface TodayAttendanceStatus {
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalWorkMinutes?: number;
  totalBreakMinutes?: number;
  status?: AttendanceStatus;
  isOnBreak?: boolean;
}
