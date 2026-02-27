import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi, pagesApi, usersApi, paymentsApi, applicationsApi, allocationsApi, expensesApi, userDashboardApi, reportsApi, authApi, meApi } from '@/lib/api';
import type { Page, User } from '@/lib/api';
import type { FormElement } from '@/types/builder';
import type { Payment, PaymentSummary } from '@/types/payment';
import type { Application, ApplicationStats } from '@/types/application';
import type { Allocation, AllocationStats } from '@/types/allocation';
import type { Expense, ExpenseChartData, ExpenseSummary } from '@/types/expense';
import type { UserDashboardStats, ProgressMetrics } from '@/types/dashboard';
import type { RegisterRequest, LoginRequest, AuthResponse } from '@/types/auth';
import type { ChangePasswordRequest } from '@/types/user';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';
import { getPreciseErrorMessage } from '@/lib/errorMessage';

// ============================================================================
// Authentication Queries & Mutations
// ============================================================================

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem('auth_token', data.token);
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success('Registration successful');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Registration failed');
      console.error('Register error:', error);
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem('auth_token', data.token);
      // Invalidate auth and dashboard queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('Login successful');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Login failed');
      console.error('Login error:', error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear token from localStorage
      localStorage.removeItem('auth_token');
      // Clear all queries
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Logout failed');
      console.error('Logout error:', error);
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: () => authApi.refreshToken(),
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Token refresh failed');
      console.error('Refresh token error:', error);
    },
  });
};

// 2FA Hooks
export const useSend2FA = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.send2FA(email),
    onSuccess: () => {
      toast.success('2FA code sent to email');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to send 2FA code');
      console.error('Send 2FA error:', error);
    },
  });
};

export const useRequest2FALoginCode = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.request2FALoginCode(email),
    onSuccess: () => {
      toast.success('2FA code sent to email');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to request 2FA code');
      console.error('Request 2FA code error:', error);
    },
  });
};

export const useVerify2FA = () => {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authApi.verify2FA(email, code),
    onSuccess: () => {
      toast.success('2FA verification successful');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? '2FA verification failed');
      console.error('Verify 2FA error:', error);
    },
  });
};

export const useVerify2FAAndLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authApi.verify2FAAndLogin(email, code),
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('Login successful');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? '2FA login verification failed');
      console.error('Verify 2FA and login error:', error);
    },
  });
};

export const useEnable2FA = () => {
  return useMutation({
    mutationFn: () => authApi.enable2FA(),
    onSuccess: () => {
      toast.success('2FA enabled successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to enable 2FA');
      console.error('Enable 2FA error:', error);
    },
  });
};

export const useDisable2FA = () => {
  return useMutation({
    mutationFn: (code: string) => authApi.disable2FA(code),
    onSuccess: () => {
      toast.success('2FA disabled successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to disable 2FA');
      console.error('Disable 2FA error:', error);
    },
  });
};

// ============================================================================
// Me  (Current User) Queries & Mutations
// ============================================================================

export const useGetMe = () => {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => meApi.getMe(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; email?: string }) => meApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to update profile');
      console.error('Update me error:', error);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => meApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to change password');
      console.error('Change password error:', error);
    },
  });
};

export const useDeleteMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => meApi.deleteMe(),
    onSuccess: () => {
      localStorage.removeItem('auth_token');
      queryClient.clear();
      toast.success('Account deleted successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to delete account');
      console.error('Delete me error:', error);
    },
  });
};

// ============================================================================
// Dashboard Queries
// ============================================================================
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: dashboardApi.getStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.activity,
    queryFn: dashboardApi.getRecentActivity,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Pages Queries
export const usePages = () => {
  return useQuery<Page[]>({
    queryKey: queryKeys.pages.all,
    queryFn: pagesApi.getAll,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Page>) => pagesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('Page created successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to create page');
      console.error('Create page error:', error);
    },
  });
};

export const useSaveTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ elements, userId, title }: { elements: FormElement[]; userId?: string; title: string }) => 
      pagesApi.saveTemplate(elements, userId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    },
    onError: (error) => {
      console.error('Save template error:', error);
    },
  });
};

export const useLinkTemplates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateIds, pageData }: { templateIds: string[]; pageData: { title: string; slug: string; description?: string; category?: string; status?: 'published' | 'draft' } }) =>
      pagesApi.linkTemplates(templateIds, pageData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      if (data.status === 'published') {
        toast.success('Templates linked and page published successfully');
      } else {
        toast.success('Templates linked and page created successfully');
      }
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to link templates');
      console.error('Link templates error:', error);
    },
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pagesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('Page deleted successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to delete page');
      console.error('Delete page error:', error);
    },
  });
};

export const useDeletePages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => pagesApi.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('Pages deleted successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to delete pages');
      console.error('Delete pages error:', error);
    },
  });
};

export const useDuplicatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pageId: string) => pagesApi.duplicatePage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('Page duplicated successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to duplicate page');
      console.error('Duplicate page error:', error);
    },
  });
};

export const usePublishExistingPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pageId: string) => pagesApi.publishPage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.published });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('Page published successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to publish page');
      console.error('Publish page error:', error);
    },
  });
};

export const useUnpublishPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pageId: string) => pagesApi.unpublishPage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.published });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('Page unpublished successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to unpublish page');
      console.error('Unpublish page error:', error);
    },
  });
};

export const usePageDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.pages.detail(id),
    queryFn: () => pagesApi.getById(id),
    enabled: !!id,
  });
};

export const usePublishPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pageId, elements, pageData }: { pageId: string | null; elements: FormElement[]; pageData: { title: string; slug: string; status: 'published' | 'draft' } }) => {
      if (pageId) {
        // update the page first
        await pagesApi.update(pageId, { elements, ...pageData });
        if (pageData.status === 'published') {
          return pagesApi.publishPage(pageId);
        }
        return pagesApi.getById(pageId);
      } else {
        const created = await pagesApi.create({
          ...pageData,
          elements,
        });
        if (pageData.status === 'published') {
          return pagesApi.publishPage(created.id);
        }
        return created;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('Page published successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to publish page');
      console.error('Publish page error:', error);
    },
  });
};

export const useUpdatePageTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId, elements }: { pageId: string; elements: FormElement[] }) =>
      pagesApi.updatePageTemplate(pageId, elements),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('Page template updated successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to update page template');
      console.error('Update page template error:', error);
    },
  });
};

export const useGetPageTemplate = () => {
  return useMutation({
    mutationFn: (pageId: string) => pagesApi.getPageTemplate(pageId),
  });
};

export const usePublishedPages = () => {
  return useQuery({
    queryKey: queryKeys.pages.published,
    queryFn: pagesApi.getPublishedPages,
    staleTime: 1000 * 60, // 1 minute
  });
};

// Users Queries
export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: queryKeys.users.all,
    queryFn: usersApi.getAll,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; email: string; role: User['role']; status?: User['status']; permissions?: User['permissions']; password?: string }) =>
      usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('User created successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to create user');
      console.error('Create user error:', error);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to update user');
      console.error('Update user error:', error);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to delete user');
      console.error('Delete user error:', error);
    },
  });
};

// Payments Queries
export const usePayments = () => {
  return useQuery<Payment[]>({
    queryKey: queryKeys.payments.all,
    queryFn: paymentsApi.getAll,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useUserPayments = (userId: string) => {
  return useQuery<Payment[]>({
    queryKey: queryKeys.payments.byUser(userId),
    queryFn: async () => {
      const list = await paymentsApi.getAll();
      return list.filter((p) => p.userId === userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};

export const usePaymentHistory = (userId: string) => {
  return useQuery<Payment[]>({
    queryKey: queryKeys.payments.byUser(userId),
    queryFn: async () => {
      const list = await paymentsApi.getAll();
      return list.filter((p) => p.userId === userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};

export const usePaymentSummary = (userId?: string) => {
  return useQuery<PaymentSummary>({
    queryKey: queryKeys.payments.summary(userId),
    queryFn: () => paymentsApi.getSummary(userId),
    staleTime: 1000 * 60,
    select: (data) => {
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return data;
      }
      return { total: 0, paid: 0, pending: 0, failed: 0, refunded: 0 };
    },
  });
};

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => paymentsApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: Payment['status']; notes?: string }) =>
      paymentsApi.updateStatus(id, status, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.summary() });
      toast.success('Payment status updated successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to update payment status');
      console.error('Update payment status error:', error);
    },
  });
};

// Applications Queries
export const useApplications = () => {
  return useQuery<Application[]>({
    queryKey: queryKeys.applications.all,
    queryFn: applicationsApi.getAll,
    staleTime: 1000 * 60,
  });
};

export const useUserApplications = (userId: string) => {
  return useQuery<Application[]>({
    queryKey: queryKeys.applications.byUser(userId),
    queryFn: async () => {
      const list = await applicationsApi.getAll();
      return list.filter((a) => a.userId === userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};

export const useApplicationStatus = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.applications.stats(userId),
    queryFn: () => applicationsApi.getStats(userId),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};

export const useApplicationStats = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.applications.stats(userId),
    queryFn: () => applicationsApi.getStats(userId),
    staleTime: 1000 * 60,
  });
};

export const useApplication = (id: string) => {
  return useQuery({
    queryKey: queryKeys.applications.detail(id),
    queryFn: () => applicationsApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Application>) => applicationsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      if (variables.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.applications.byUser(variables.userId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.applications.stats(variables.userId) });
      }
      toast.success('Application created successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to create application');
      console.error('Create application error:', error);
    },
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: string; status: Application['status']; rejectionReason?: string }) =>
      applicationsApi.updateStatus(id, status, rejectionReason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.byUser(data.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.stats(data.userId) });
      if (data.pageId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.applications.byPage(data.pageId, data.userId) });
      }
      toast.success('Application status updated successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to update application status');
      console.error('Update application status error:', error);
    },
  });
};

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { pageId: string; userId: string; formData: Record<string, unknown>; status?: 'draft' | 'submitted' }) =>
      applicationsApi.submitApplication(params.pageId, params.userId, params.formData as Record<string, never>, params.status || 'submitted'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.byUser(data.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.byPage(data.pageId || '', data.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.stats(data.userId) });
      if (data.status === 'submitted') {
        toast.success('Application submitted successfully');
      } else {
        toast.success('Application saved as draft');
      }
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to submit application');
      console.error('Submit application error:', error);
    },
  });
};

export const useApplicationsByPage = (pageId: string, userId?: string) => {
  return useQuery({
    queryKey: queryKeys.applications.byPage(pageId, userId),
    queryFn: () => applicationsApi.getByPageId(pageId, userId),
    enabled: !!pageId,
    staleTime: 1000 * 60,
  });
};

// Allocations Queries
export const useAllocations = () => {
  return useQuery<Allocation[]>({
    queryKey: queryKeys.allocations.all,
    queryFn: allocationsApi.getAll,
    staleTime: 1000 * 60,
  });
};

export const useUserAllocations = (userId: string) => {
  return useQuery<Allocation[]>({
    queryKey: queryKeys.allocations.byUser(userId),
    queryFn: () => allocationsApi.getByUserId(userId),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};

export const useAllocationStats = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.allocations.stats(userId),
    queryFn: () => allocationsApi.getStats(userId),
    staleTime: 1000 * 60,
  });
};

export const useAllocation = (id: string) => {
  return useQuery({
    queryKey: queryKeys.allocations.detail(id),
    queryFn: () => allocationsApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};

export const useUpdateAllocationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: Allocation['status']; notes?: string }) =>
      allocationsApi.updateStatus(id, status, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.byUser(data.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.stats(data.userId) });
      toast.success('Allocation status updated successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to update allocation status');
      console.error('Update allocation status error:', error);
    },
  });
};

// Expenses Queries
export const useExpenses = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.expenses.byUser(userId),
    queryFn: async () => {
      const list = await expensesApi.getAll();
      return list.filter((e) => e.userId === userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};

export const useExpenseChart = (userId: string, days: number = 30) => {
  return useQuery({
    queryKey: queryKeys.expenses.chart(userId, days),
    queryFn: () => expensesApi.getChartData(userId, days),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};

export const useExpenseSummary = (userId: string, days: number = 30) => {
  return useQuery({
    queryKey: queryKeys.expenses.summary(userId, days),
    queryFn: () => expensesApi.getSummary(userId, days),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};

// Dashboard Queries
export const useUserDashboardStats = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.dashboard.userStats(userId),
    queryFn: () => userDashboardApi.getStats(userId),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};

export const useProgressMetrics = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.dashboard.progress(userId),
    queryFn: () => userDashboardApi.getProgressMetrics(userId),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};

// Reports Queries
export const useGenerateApprovalSheet = () => {
  return useMutation({
    mutationFn: ({ applicationId, allocationId }: { applicationId: string; allocationId?: string }) =>
      reportsApi.generateApprovalSheet(applicationId, allocationId),
    onSuccess: () => {
      toast.success('Approval sheet generated successfully');
    },
    onError: (error) => {
      toast.error('Failed to generate approval sheet');
      console.error('Generate approval sheet error:', error);
    },
  });
};

export const useGenerateStatusReport = () => {
  return useMutation({
    mutationFn: (applicationId: string) => reportsApi.generateStatusReport(applicationId),
    onSuccess: () => {
      toast.success('Status report generated successfully');
    },
    onError: (error) => {
      toast.error('Failed to generate status report');
      console.error('Generate status report error:', error);
    },
  });
};

export const useGenerateAllocationsReport = () => {
  return useMutation({
    mutationFn: (applicationId: string) => reportsApi.generateAllocationsReport(applicationId),
    onSuccess: () => {
      toast.success('Allocations report generated successfully');
    },
    onError: (error) => {
      toast.error('Failed to generate allocations report');
      console.error('Generate allocations report error:', error);
    },
  });
};

export const useGenerateBillInvoice = () => {
  return useMutation({
    mutationFn: ({ applicationId, type }: { applicationId: string; type: 'bill' | 'invoice' }) =>
      reportsApi.generateBillInvoice(applicationId, type),
    onSuccess: () => {
      toast.success('Bill/Invoice generated successfully');
    },
    onError: (error) => {
      toast.error('Failed to generate bill/invoice');
      console.error('Generate bill/invoice error:', error);
    },
  });
};

export const useGenerateCertificate = () => {
  return useMutation({
    mutationFn: (applicationId: string) => reportsApi.generateCertificate(applicationId),
    onSuccess: () => {
      toast.success('Certificate generated successfully');
    },
    onError: (error) => {
      toast.error('Failed to generate certificate');
      console.error('Generate certificate error:', error);
    },
  });
};

// ============================================================================
// Additional User Stats Hooks
// ============================================================================

export const useUserDetail = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => usersApi.getById(userId),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};

export const useUserStats = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.users.stats(userId),
    queryFn: () => userDashboardApi.getStats(userId),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};

// ============================================================================
// Additional Payment Hooks
// ============================================================================

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Payment>) => paymentsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.summary() });
      if (variables.applicationId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.byApplication(variables.applicationId) });
      }
      toast.success('Payment created successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to create payment');
      console.error('Create payment error:', error);
    },
  });
};

export const useApplicationPayments = (applicationId: string) => {
  return useQuery({
    queryKey: queryKeys.payments.byApplication(applicationId),
    queryFn: () => paymentsApi.getByApplicationId(applicationId),
    enabled: !!applicationId,
    staleTime: 1000 * 60,
  });
};

// ============================================================================
// Additional Allocation Hooks
// ============================================================================

export const useCreateAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Allocation>) => allocationsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.stats() });
      if (variables.applicationId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.allocations.byApplication(variables.applicationId) });
      }
      toast.success('Allocation created successfully');
    },
    onError: (error) => {
      toast.error(getPreciseErrorMessage(error) ?? 'Failed to create allocation');
      console.error('Create allocation error:', error);
    },
  });
};

export const useApplicationAllocations = (applicationId: string) => {
  return useQuery({
    queryKey: queryKeys.allocations.byApplication(applicationId),
    queryFn: () => allocationsApi.getByApplicationId(applicationId),
    enabled: !!applicationId,
    staleTime: 1000 * 60,
  });
};

// ============================================================================
// Application Status History
// ============================================================================

export const useApplicationStatusHistory = (applicationId: string) => {
  return useQuery({
    queryKey: queryKeys.applications.statusHistory(applicationId),
    queryFn: () => applicationsApi.getStatusHistory(applicationId),
    enabled: !!applicationId,
    staleTime: 1000 * 60,
  });
};

