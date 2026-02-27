// API client and data fetching functions (real backend via `apiClient`)

import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './apiClient';
import { getBaseUrl } from '@/config/env';
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

type ListEnvelope<T> = {
  data: T[];
  [key: string]: unknown;
};

function extractList<T>(value: unknown): T[] | null {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== 'object' || value === null) return null;
  if (!('data' in value)) return null;
  const data = (value as Record<string, unknown>).data;
  if (!Array.isArray(data)) return null;
  return data as T[];
}

async function apiListGet<T>(endpoint: string): Promise<T[]> {
  // Many endpoints are paginated: { ok, data: { data: [...] } }.
  // `apiClient` unwraps the first `data`, leaving either an array, or `{ data: [...] }`.
  const raw = await apiGet<unknown>(endpoint);
  const list = extractList<T>(raw);
  return list ?? [];
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

type UserCreateInput = {
  name: string;
  email: string;
  role: UserRole;
  status?: 'active' | 'inactive';
  permissions?: Permission;
  /**
   * Optional. If omitted, backend can auto-generate / invite flow.
   */
  password?: string;
};

type UserUpdateInput = {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: 'active' | 'inactive';
  permissions?: Permission;
};

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
    return apiPost<unknown>('/auth/2fa/request-login-code', payload).then(() => {});
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
    return apiListGet<Activity>('/dashboard/activity');
  },
};

// ============================================================================
// Root & Health
// ============================================================================

export const systemApi = {
  getInfo: async (): Promise<unknown> => {
    // Note: root endpoint is outside `/api`
    return apiGet<unknown>(`${getBaseUrl()}/`);
  },

  health: async (): Promise<unknown> => {
    // Note: health endpoint is outside `/api`
    return apiGet<unknown>(`${getBaseUrl()}/health`);
  },
};

// Pages API (real backend)
export const pagesApi = {
  getAll: async (): Promise<Page[]> => {
    return apiListGet<Page>('/pages');
  },

  create: async (data: Partial<Page>): Promise<Page> => {
    return apiPost<Page>('/pages', data);
  },

  update: async (id: string, data: Partial<Page>): Promise<Page> => {
    return apiPut<Page>(`/pages/${id}`, data);
  },

  patch: async (id: string, data: Partial<Page>): Promise<Page> => {
    return apiPatch<Page>(`/pages/${id}`, data);
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

  publishPage: async (pageId: string): Promise<Page> => {
    return apiPost<Page>(`/pages/${pageId}/publish`);
  },

  updatePageTemplate: async (
    pageId: string,
    elements: FormElement[]
  ): Promise<Page> => {
    return pagesApi.update(pageId, { elements });
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
    return apiListGet<Page>('/pages?status=published');
  },
};

// Users API (real backend)
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const users = await apiListGet<User>('/users');
    return users.map((user) => ({
      ...user,
      permissions: user.permissions || getDefaultPermissionsForRole(user.role),
    }));
  },

  getById: async (id: string): Promise<User> => {
    const user = await apiGet<User>(`/users/${id}`);
    return {
      ...user,
      permissions: user.permissions || getDefaultPermissionsForRole(user.role),
    };
  },

  getDashboardStats: async (userId: string): Promise<UserDashboardStats> => {
    return apiGet<UserDashboardStats>(`/users/${userId}/dashboard-stats`);
  },

  getProgressMetrics: async (userId: string): Promise<ProgressMetrics> => {
    return apiGet<ProgressMetrics>(`/users/${userId}/progress-metrics`);
  },

  create: async (data: UserCreateInput): Promise<User> => {
    const created = await apiPost<User>('/users', data);
    return {
      ...created,
      permissions:
        created.permissions || getDefaultPermissionsForRole(created.role),
    };
  },

  update: async (id: string, data: UserUpdateInput): Promise<User> => {
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
    return apiListGet<Payment>('/payments');
  },

  getByUserId: async (userId: string): Promise<Payment[]> => {
    return apiListGet<Payment>(`/payments?userId=${encodeURIComponent(userId)}`);
  },

  getByApplicationId: async (applicationId: string): Promise<Payment[]> => {
    return apiListGet<Payment>(
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
    // Postman: GET /payments/summary (backend can scope by role/token)
    return apiGet<PaymentSummary>('/payments/summary');
  },
};

// Applications API (real backend)
export const applicationsApi = {
  getAll: async (): Promise<Application[]> => {
    return apiListGet<Application>('/applications');
  },

  getByUserId: async (userId: string): Promise<Application[]> => {
    // Postman: GET /applications (backend can scope by role/token)
    return apiListGet<Application>('/applications');
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
    // Backend may support query params; fall back to filtering client-side
    const list = await apiListGet<Application>('/applications');
    return list.filter((a) => a.pageId === pageId && (!userId || a.userId === userId));
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
    return apiGet<ApplicationStats>('/applications/stats');
  },
};

// Allocations API (real backend)
export const allocationsApi = {
  getAll: async (): Promise<Allocation[]> => {
    return apiListGet<Allocation>('/allocations');
  },

  getByUserId: async (userId: string): Promise<Allocation[]> => {
    const list = await apiListGet<Allocation>('/allocations');
    return list.filter((a) => a.userId === userId);
  },

  getByApplicationId: async (applicationId: string): Promise<Allocation[]> => {
    return apiListGet<Allocation>(
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
    status: Allocation['status'],
    notes?: string
  ): Promise<Allocation> => {
    return apiPatch<Allocation>(`/allocations/${id}/status`, { status, notes });
  },

  getStats: async (userId?: string): Promise<AllocationStats> => {
    return apiGet<AllocationStats>('/allocations/stats');
  },
};

// Expenses API (real backend)
export const expensesApi = {
  getAll: async (): Promise<Expense[]> => {
    return apiListGet<Expense>('/expenses');
  },

  getByDateRange: async (
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Expense[]> => {
    const list = await apiListGet<Expense>('/expenses');
    return list.filter((e) => e.date >= startDate && e.date <= endDate);
  },

  getChartData: async (
    userId: string,
    days: number = 30
  ): Promise<ExpenseChartData[]> => {
    // Postman: GET /expenses/chart
    return apiGet<ExpenseChartData[]>('/expenses/chart');
  },

  getSummary: async (
    userId: string,
    days: number = 30
  ): Promise<ExpenseSummary> => {
    // Postman: GET /expenses/summary
    return apiGet<ExpenseSummary>('/expenses/summary');
  },
};

// Dashboard API Extensions (real backend)
export const userDashboardApi = {
  getStats: async (userId: string): Promise<UserDashboardStats> => {
    return usersApi.getDashboardStats(userId);
  },

  getProgressMetrics: async (userId: string): Promise<ProgressMetrics> => {
    return usersApi.getProgressMetrics(userId);
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

