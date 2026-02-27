// API client and data fetching functions
// In production, replace these with actual API calls
// 
// To use a real API:
// 1. Set VITE_API_URL in your .env file (see env.example)
// 2. Replace the mock implementations below with calls to apiClient
//    Example: import { apiGet } from './apiClient';
//             const data = await apiGet('/dashboard/stats');

import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './apiClient';
import type { FormElement } from '@/types/builder';
import type { Payment, PaymentSummary } from '@/types/payment';
import type { Application, ApplicationStats, ApplicationStatusHistory } from '@/types/application';
import { extractApplicantFromFormData, getApplicantName, getApplicantEmail, getApplicantPhone } from './applicantUtils';
import type { Allocation, AllocationStats } from '@/types/allocation';
import type { Expense, ExpenseChartData, ExpenseSummary } from '@/types/expense';
import type { UserDashboardStats, ProgressMetrics } from '@/types/dashboard';

export interface DashboardStats {
  totalTemplates: number;
  publishedPages: number;
  totalUsers: number;
  completionRate: number;
}

export interface Activity {
  id: string;
  action: string;
  time: string;
  icon: string;
}

// Generic API response wrapper used by the backend
export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string | null;
  code?: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  updatedAt: string;
  views: number;
  templateId?: string;
  elements: FormElement[];
  publishedAt?: string;
  createdBy?: string;
  // New fields for template/page distinction
  isTemplate?: boolean; // true if this is a template, false if it's a named page
  isNamed?: boolean; // true if template has been given a name
  templateIds?: string[]; // Array of template IDs linked together to form a page
  description?: string;
  category?: string; // Category for organizing forms (e.g., 'Land Allocation', 'Registration', 'Application')
}

import type {
  UserRole,
  Permission,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  TwoFactorSendRequest,
  TwoFactorRequestLoginCodeRequest,
  TwoFactorVerifyRequest,
  TwoFactorVerifyLoginRequest,
  TwoFactorVerifyLoginResponse,
  TwoFactorDisableRequest,
} from '@/types/auth';
import type { User as ApiUser, ChangePasswordRequest } from '@/types/user';
import { getDefaultPermissionsForRole } from '@/lib/permissions';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  joinedAt: string;
  permissions?: Permission;
}

// ============================================================================
// Authentication & Current User API
// ============================================================================

export const authApi = {
  register: (data: RegisterRequest): Promise<AuthResponse> => {
    // Backend: POST /auth/register -> AuthResponse
    return apiPost<AuthResponse>('/auth/register', data);
  },

  login: (data: LoginRequest): Promise<AuthResponse> => {
    // Backend: POST /auth/login -> AuthResponse
    return apiPost<AuthResponse>('/auth/login', data);
  },

  logout: (): Promise<void> => {
    // Backend: POST /auth/logout (body optional)
    return apiPost<unknown>('/auth/logout', {}).then(() => {});
  },

  refreshToken: (): Promise<AuthResponse> => {
    // Backend: POST /auth/refresh -> AuthResponse
    return apiPost<AuthResponse>('/auth/refresh', {});
  },

  // 2FA endpoints
  send2FA: (email: string): Promise<void> => {
    const payload: TwoFactorSendRequest = { email };
    // Backend: POST /auth/2fa/send
    return apiPost<unknown>('/auth/2fa/send', payload).then(() => {});
  },

  request2FALoginCode: (email: string): Promise<void> => {
    const payload: TwoFactorRequestLoginCodeRequest = { email };
    // For login flows we can reuse the same backend endpoint
    return apiPost<unknown>('/auth/2fa/send', payload).then(() => {});
  },

  verify2FA: (email: string, code: string): Promise<void> => {
    const payload: TwoFactorVerifyRequest = { email, code };
    // Backend: POST /auth/2fa/verify
    return apiPost<unknown>('/auth/2fa/verify', payload).then(() => {});
  },

  verify2FAAndLogin: (
    email: string,
    code: string
  ): Promise<TwoFactorVerifyLoginResponse> => {
    const payload: TwoFactorVerifyLoginRequest = { email, code };
    // Backend: POST /auth/2fa/verify-login -> TwoFactorVerifyLoginResponse
    return apiPost<TwoFactorVerifyLoginResponse>('/auth/2fa/verify-login', payload);
  },

  enable2FA: (): Promise<void> => {
    // Backend: POST /auth/2fa/enable
    return apiPost<unknown>('/auth/2fa/enable', {}).then(() => {});
  },

  disable2FA: (code: string): Promise<void> => {
    const payload: TwoFactorDisableRequest = { code };
    // Backend: POST /auth/2fa/disable
    return apiPost<unknown>('/auth/2fa/disable', payload).then(() => {});
  },
};

export const meApi = {
  getMe: (): Promise<ApiUser> => {
    // Backend: GET /me -> ApiUser (optionally wrapped)
    return apiGet<ApiUser>('/me');
  },

  updateMe: (data: { name?: string; email?: string }): Promise<ApiUser> => {
    // Backend: PATCH /me -> ApiUser
    return apiPatch<ApiUser>('/me', data);
  },

  changePassword: (data: ChangePasswordRequest): Promise<void> => {
    // Backend: POST /me/change-password
    return apiPost<unknown>('/me/change-password', data).then(() => {});
  },

  deleteMe: (): Promise<void> => {
    // Backend: DELETE /me
    return apiDelete<unknown>('/me').then(() => {});
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    // apiClient unwraps the outer { ok, data } wrapper, so we ask for the inner payload
    const data = await apiGet<DashboardStats>('/dashboard/stats');
    return data;
  },

  getRecentActivity: async (): Promise<Activity[]> => {
    // Backend returns: { ok, data: { data: Activity[] } }
    // apiClient unwraps the first `data`, so we receive { data: Activity[] }
    const wrapped = await apiGet<{ data: Activity[] }>('/dashboard/activity');
    return wrapped.data;
  },
};

// Pages API (real backend)
export const pagesApi = {
  getAll: async (): Promise<Page[]> => {
    return apiGet<Page[]>('/pages');
  },

  create: async (data: Partial<Page>): Promise<Page> => {
    return apiPost<Page>('/pages', data);
  },

  // Save a template (auto-saved from builder)
  saveTemplate: async (
    elements: FormElement[],
    userId?: string,
    title?: string
  ): Promise<Page> => {
    return apiPost<Page>('/templates', {
      elements,
      userId,
      title,
    });
  },

  // Link templates together and name the page
  linkTemplates: async (
    templateIds: string[],
    pageData: {
      title: string;
      slug: string;
      description?: string;
      status?: 'published' | 'draft';
      category?: string;
    }
  ): Promise<Page> => {
    return apiPost<Page>('/pages/link-templates', {
      templateIds,
      ...pageData,
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiDelete<unknown>(`/pages/${id}`);
  },

  getById: async (id: string): Promise<Page> => {
    return apiGet<Page>(`/pages/${id}`);
  },

  publishPage: async (pageId: string, elements: FormElement[]): Promise<Page> => {
    // Update elements, then publish
    await apiPut<Page>(`/pages/${pageId}`, { elements });
    return apiPost<Page>(`/pages/${pageId}/publish`);
  },

  updatePageTemplate: async (
    pageId: string,
    elements: FormElement[]
  ): Promise<Page> => {
    return apiPut<Page>(`/pages/${pageId}`, { elements });
  },

  getPageTemplate: async (pageId: string): Promise<FormElement[]> => {
    const page = await apiGet<Page>(`/pages/${pageId}`);
    return page.elements || [];
  },

  unpublishPage: async (pageId: string): Promise<void> => {
    await apiPost<unknown>(`/pages/${pageId}/unpublish`);
  },

  duplicatePage: async (pageId: string): Promise<Page> => {
    return apiPost<Page>(`/pages/${pageId}/duplicate`);
  },

  getPublishedPages: async (): Promise<Page[]> => {
    // Backend can filter via query or separate endpoint; we use query
    return apiGet<Page[]>('/pages?status=published');
  },
};

// Users API (real backend)
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const users = await apiGet<User[]>('/users');
    return users.map((user) => ({
          ...user,
          permissions: user.permissions || getDefaultPermissionsForRole(user.role),
        }));
  },

  create: async (data: Partial<User>): Promise<User> => {
    const created = await apiPost<User>('/users', data);
    return {
      ...created,
      permissions:
        created.permissions || getDefaultPermissionsForRole(created.role),
    };
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const updated = await apiPut<User>(`/users/${id}`, data);
    return {
      ...updated,
      permissions:
        updated.permissions || getDefaultPermissionsForRole(updated.role),
    };
  },

  delete: async (id: string): Promise<void> => {
    await apiDelete<unknown>(`/users/${id}`);
  },
};

// Payments API (real backend)
export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    return apiGet<Payment[]>('/payments');
  },

  getByUserId: async (userId: string): Promise<Payment[]> => {
    return apiGet<Payment[]>(`/payments?userId=${encodeURIComponent(userId)}`);
  },

  getByApplicationId: async (applicationId: string): Promise<Payment[]> => {
    return apiGet<Payment[]>(
      `/payments?applicationId=${encodeURIComponent(applicationId)}`
    );
  },

  getById: async (id: string): Promise<Payment | undefined> => {
    return apiGet<Payment>(`/payments/${id}`);
  },

  create: async (data: Partial<Payment>): Promise<Payment> => {
    return apiPost<Payment>('/payments', data);
  },

  updateStatus: async (
    id: string,
    status: Payment['status'],
    notes?: string
  ): Promise<Payment> => {
    return apiPatch<Payment>(`/payments/${id}/status`, { status, notes });
  },

  getSummary: async (userId?: string): Promise<PaymentSummary> => {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return apiGet<PaymentSummary>(`/payments/summary${query}`);
  },
};

// Applications API (real backend)
export const applicationsApi = {
  getAll: async (): Promise<Application[]> => {
    return apiGet<Application[]>('/applications');
  },

  getByUserId: async (userId: string): Promise<Application[]> => {
    return apiGet<Application[]>(
      `/applications?userId=${encodeURIComponent(userId)}`
    );
  },

  getById: async (id: string): Promise<Application | undefined> => {
    return apiGet<Application>(`/applications/${id}`);
  },

  create: async (data: Partial<Application>): Promise<Application> => {
    return apiPost<Application>('/applications', data);
  },

  submitApplication: async (
    pageId: string,
    userId: string,
    formData: Record<string, unknown>,
    status: 'draft' | 'submitted' = 'submitted'
  ): Promise<Application> => {
    return apiPost<Application>('/applications/submit', {
      pageId,
      userId,
      formData,
      status,
    });
  },

  getByPageId: async (
    pageId: string,
    userId?: string
  ): Promise<Application[]> => {
    const params = new URLSearchParams({ pageId });
    if (userId) params.set('userId', userId);
    return apiGet<Application[]>(`/applications?${params.toString()}`);
  },

  updateStatus: async (
    id: string,
    status: Application['status'],
    rejectionReason?: string
  ): Promise<Application> => {
    return apiPatch<Application>(`/applications/${id}/status`, {
        status,
      rejectionReason,
    });
  },

  getStatusHistory: async (
    applicationId: string
  ): Promise<ApplicationStatusHistory[]> => {
    return apiGet<ApplicationStatusHistory[]>(
      `/applications/${applicationId}/history`
    );
  },

  getStats: async (userId?: string): Promise<ApplicationStats> => {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return apiGet<ApplicationStats>(`/applications/stats${query}`);
  },
};

// Allocations API (real backend)
export const allocationsApi = {
  getAll: async (): Promise<Allocation[]> => {
    return apiGet<Allocation[]>('/allocations');
  },

  getByUserId: async (userId: string): Promise<Allocation[]> => {
    return apiGet<Allocation[]>(
      `/allocations?userId=${encodeURIComponent(userId)}`
    );
  },

  getByApplicationId: async (applicationId: string): Promise<Allocation[]> => {
    return apiGet<Allocation[]>(
      `/allocations?applicationId=${encodeURIComponent(applicationId)}`
    );
  },

  getById: async (id: string): Promise<Allocation | undefined> => {
    return apiGet<Allocation>(`/allocations/${id}`);
  },

  create: async (data: Partial<Allocation>): Promise<Allocation> => {
    return apiPost<Allocation>('/allocations', data);
  },

  updateStatus: async (
    id: string,
    status: Allocation['status']
  ): Promise<Allocation> => {
    return apiPatch<Allocation>(`/allocations/${id}/status`, { status });
  },

  getStats: async (userId?: string): Promise<AllocationStats> => {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return apiGet<AllocationStats>(`/allocations/stats${query}`);
  },
};

// Expenses API (real backend)
export const expensesApi = {
  getByUserId: async (userId: string): Promise<Expense[]> => {
    return apiGet<Expense[]>(`/expenses?userId=${encodeURIComponent(userId)}`);
  },

  getByDateRange: async (
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Expense[]> => {
    const params = new URLSearchParams({
      userId,
      startDate,
      endDate,
    });
    return apiGet<Expense[]>(`/expenses?${params.toString()}`);
  },

  getChartData: async (
    userId: string,
    days: number = 30
  ): Promise<ExpenseChartData[]> => {
    const params = new URLSearchParams({
      userId,
      days: String(days),
    });
    return apiGet<ExpenseChartData[]>(`/expenses/chart?${params.toString()}`);
  },

  getSummary: async (
    userId: string,
    days: number = 30
  ): Promise<ExpenseSummary> => {
    const params = new URLSearchParams({
      userId,
      days: String(days),
    });
    return apiGet<ExpenseSummary>(
      `/expenses/summary?${params.toString()}`
    );
  },
};

// Dashboard API Extensions (real backend)
export const userDashboardApi = {
  getStats: async (userId: string): Promise<UserDashboardStats> => {
    return apiGet<UserDashboardStats>(`/users/${userId}/dashboard-stats`);
  },

  getProgressMetrics: async (userId: string): Promise<ProgressMetrics> => {
    return apiGet<ProgressMetrics>(`/users/${userId}/progress-metrics`);
  },
};

// Reports API (real backend)
export const reportsApi = {
  generateApprovalSheet: async (
    applicationId: string,
    allocationId?: string
  ): Promise<string> => {
    const body: { applicationId: string; allocationId?: string } = {
      applicationId,
    };
    if (allocationId) body.allocationId = allocationId;
    return apiPost<string>('/reports/approval-sheet', body);
  },

  generateStatusReport: async (applicationId: string): Promise<string> => {
    return apiPost<string>('/reports/status-report', { applicationId });
  },

  generateAllocationsReport: async (
    applicationId: string
  ): Promise<string> => {
    return apiPost<string>('/reports/allocations-report', { applicationId });
  },

  generateBillInvoice: async (
    applicationId: string,
    type: 'bill' | 'invoice'
  ): Promise<string> => {
    return apiPost<string>('/reports/bill-invoice', { applicationId, type });
  },

  generateCertificate: async (applicationId: string): Promise<string> => {
    return apiPost<string>('/reports/certificate', { applicationId });
  },
};

