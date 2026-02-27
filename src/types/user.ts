// User types including API request/response types
import type { UserRole, Permission } from './auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  permissions?: Permission;
  twoFactorEnabled?: boolean;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status?: 'active' | 'inactive';
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: 'active' | 'inactive';
}

export interface UserDashboardStats {
  userId: string;
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  totalAllocations: number;
  totalPayments: number;
  totalExpenses: number;
}

export interface ProgressMetrics {
  userId: string;
  completionPercentage: number;
  lastActivityDate?: string;
  applicationProgress: {
    completed: number;
    inProgress: number;
    notStarted: number;
  };
  paymentProgress: {
    paid: number;
    pending: number;
    overdue: number;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
