export type Role =
  | 'ROLE_SUPER_ADMIN'
  | 'ROLE_ADMIN'
  | 'ROLE_HR'
  | 'ROLE_MANAGER'
  | 'ROLE_EMPLOYEE'
  | 'ROLE_IT_ADMIN';

export interface User {
  id?: number;
  userId?: number;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role: Role;
  isActive?: boolean;
  emailVerified?: boolean;
  employeeId?: number;
  employeeNumber?: string;
  tenantId?: string;
  mustChangePassword?: boolean;
  profilePicture?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  tenantId: string;
  userId: number;
  employeeId?: number;
  email: string;
  fullName: string;
  role: Role;
  emailVerified?: boolean;
  profilePicture?: string;
  mustChangePassword?: boolean;
  totpEnabled?: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  totpCode?: number;
}
