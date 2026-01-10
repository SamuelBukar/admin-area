import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi, pagesApi, usersApi, paymentsApi, applicationsApi, allocationsApi, expensesApi, userDashboardApi, reportsApi } from '@/lib/api';
import type { Page, User } from '@/lib/api';
import type { FormElement } from '@/types/builder';
import type { Payment, PaymentSummary } from '@/types/payment';
import type { Application, ApplicationStats } from '@/types/application';
import type { Allocation, AllocationStats } from '@/types/allocation';
import type { Expense, ExpenseChartData, ExpenseSummary } from '@/types/expense';
import type { UserDashboardStats, ProgressMetrics } from '@/types/dashboard';
import { toast } from 'sonner';

// Query Keys - Centralized for better cache management
export const queryKeys = {
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    activity: ['dashboard', 'activity'] as const,
    userStats: (userId: string) => ['dashboard', 'userStats', userId] as const,
    progress: (userId: string) => ['dashboard', 'progress', userId] as const,
  },
  pages: {
    all: ['pages'] as const,
    detail: (id: string) => ['pages', id] as const,
    published: ['pages', 'published'] as const,
  },
  applications: {
    all: ['applications'] as const,
    byUser: (userId: string) => ['applications', 'user', userId] as const,
    byPage: (pageId: string, userId?: string) => ['applications', 'page', pageId, userId] as const,
    detail: (id: string) => ['applications', id] as const,
    stats: (userId?: string) => ['applications', 'stats', userId] as const,
    statusHistory: (id: string) => ['applications', 'statusHistory', id] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
  },
  payments: {
    all: ['payments'] as const,
    byUser: (userId: string) => ['payments', 'user', userId] as const,
    byApplication: (appId: string) => ['payments', 'application', appId] as const,
    detail: (id: string) => ['payments', id] as const,
    summary: (userId?: string) => ['payments', 'summary', userId] as const,
  },
  allocations: {
    all: ['allocations'] as const,
    byUser: (userId: string) => ['allocations', 'user', userId] as const,
    byApplication: (appId: string) => ['allocations', 'application', appId] as const,
    detail: (id: string) => ['allocations', id] as const,
    stats: (userId?: string) => ['allocations', 'stats', userId] as const,
  },
  expenses: {
    byUser: (userId: string) => ['expenses', 'user', userId] as const,
    chart: (userId: string, days: number) => ['expenses', 'chart', userId, days] as const,
    summary: (userId: string, days: number) => ['expenses', 'summary', userId, days] as const,
  },
} as const;

// Dashboard Queries
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
  return useQuery({
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
      toast.error('Failed to create page');
      console.error('Create page error:', error);
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
      toast.error('Failed to delete page');
      console.error('Delete page error:', error);
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
    mutationFn: ({ pageId, elements, pageData }: { pageId: string | null; elements: FormElement[]; pageData: { title: string; slug: string; status: 'published' | 'draft' } }) => {
      if (pageId) {
        return pagesApi.updatePageTemplate(pageId, elements);
      } else {
        return pagesApi.create({
          ...pageData,
          elements,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('Page published successfully');
    },
    onError: (error) => {
      toast.error('Failed to publish page');
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
      toast.error('Failed to update page template');
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
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: usersApi.getAll,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success('User created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create user');
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
      toast.error('Failed to update user');
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
      toast.error('Failed to delete user');
      console.error('Delete user error:', error);
    },
  });
};

// Payments Queries
export const usePayments = () => {
  return useQuery({
    queryKey: queryKeys.payments.all,
    queryFn: paymentsApi.getAll,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useUserPayments = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.payments.byUser(userId),
    queryFn: () => paymentsApi.getByUserId(userId),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};

export const usePaymentHistory = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.payments.byUser(userId),
    queryFn: () => paymentsApi.getByUserId(userId),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};

export const usePaymentSummary = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.payments.summary(userId),
    queryFn: () => paymentsApi.getSummary(userId),
    staleTime: 1000 * 60,
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
      toast.error('Failed to update payment status');
      console.error('Update payment status error:', error);
    },
  });
};

// Applications Queries
export const useApplications = () => {
  return useQuery({
    queryKey: queryKeys.applications.all,
    queryFn: applicationsApi.getAll,
    staleTime: 1000 * 60,
  });
};

export const useUserApplications = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.applications.byUser(userId),
    queryFn: () => applicationsApi.getByUserId(userId),
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
      toast.error('Failed to create application');
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
      toast.error('Failed to update application status');
      console.error('Update application status error:', error);
    },
  });
};

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId, userId, formData, status }: { pageId: string; userId: string; formData: Record<string, any>; status?: 'draft' | 'submitted' }) =>
      applicationsApi.submitApplication(pageId, userId, formData, status || 'submitted'),
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
      toast.error('Failed to submit application');
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
  return useQuery({
    queryKey: queryKeys.allocations.all,
    queryFn: allocationsApi.getAll,
    staleTime: 1000 * 60,
  });
};

export const useUserAllocations = (userId: string) => {
  return useQuery({
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
    mutationFn: ({ id, status }: { id: string; status: Allocation['status'] }) =>
      allocationsApi.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.byUser(data.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.stats(data.userId) });
      toast.success('Allocation status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update allocation status');
      console.error('Update allocation status error:', error);
    },
  });
};

// Expenses Queries
export const useExpenses = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.expenses.byUser(userId),
    queryFn: () => expensesApi.getByUserId(userId),
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

