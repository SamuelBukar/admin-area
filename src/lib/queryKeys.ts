// Centralized query keys for TanStack Query
// This file organizes all cache keys by feature for better maintainability
// https://tanstack.com/query/latest/docs/react/guides/important-defaults

export const queryKeys = {
  // Auth related queries
  auth: {
    me: ['auth', 'me'] as const,
    all: ['auth'] as const,
  },

  // Dashboard queries
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    activity: ['dashboard', 'activity'] as const,
    userStats: (userId: string) => ['dashboard', 'userStats', userId] as const,
    progress: (userId: string) => ['dashboard', 'progress', userId] as const,
  },

  // Pages queries
  pages: {
    all: ['pages'] as const,
    detail: (id: string) => ['pages', id] as const,
    published: ['pages', 'published'] as const,
    byTemplate: (templateId: string) => ['pages', 'byTemplate', templateId] as const,
  },

  // Templates queries
  templates: {
    all: ['templates'] as const,
    byUser: (userId: string) => ['templates', 'byUser', userId] as const,
  },

  // Applications queries
  applications: {
    all: ['applications'] as const,
    byUser: (userId: string) => ['applications', 'user', userId] as const,
    byPage: (pageId: string, userId?: string) =>
      ['applications', 'page', pageId, ...(userId ? [userId] : [])] as const,
    detail: (id: string) => ['applications', id] as const,
    stats: (userId?: string) =>
      ['applications', 'stats', ...(userId ? [userId] : [])] as const,
    statusHistory: (id: string) => ['applications', 'statusHistory', id] as const,
  },

  // Users queries
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
    stats: (id: string) => ['users', id, 'stats'] as const,
    progressMetrics: (id: string) => ['users', id, 'progressMetrics'] as const,
  },

  // Payments queries
  payments: {
    all: ['payments'] as const,
    byUser: (userId: string) => ['payments', 'user', userId] as const,
    byApplication: (appId: string) => ['payments', 'application', appId] as const,
    detail: (id: string) => ['payments', id] as const,
    summary: (userId?: string) =>
      ['payments', 'summary', ...(userId ? [userId] : [])] as const,
  },

  // Allocations queries
  allocations: {
    all: ['allocations'] as const,
    byUser: (userId: string) => ['allocations', 'user', userId] as const,
    byApplication: (appId: string) => ['allocations', 'application', appId] as const,
    detail: (id: string) => ['allocations', id] as const,
    stats: (userId?: string) =>
      ['allocations', 'stats', ...(userId ? [userId] : [])] as const,
  },

  // Expenses queries
  expenses: {
    all: ['expenses'] as const,
    byUser: (userId: string) => ['expenses', 'user', userId] as const,
    chart: (userId: string, days?: number) =>
      ['expenses', 'chart', userId, ...(days ? [days] : [])] as const,
    summary: (userId: string, days?: number) =>
      ['expenses', 'summary', userId, ...(days ? [days] : [])] as const,
  },

  // Reports queries
  reports: {
    approvalSheet: (appId: string, allocId?: string) =>
      ['reports', 'approvalSheet', appId, ...(allocId ? [allocId] : [])] as const,
    statusReport: (appId: string) => ['reports', 'statusReport', appId] as const,
    allocationsReport: (appId: string) => ['reports', 'allocationsReport', appId] as const,
    bill: (appId: string, type?: string) =>
      ['reports', 'bill', appId, ...(type ? [type] : [])] as const,
    certificate: (appId: string) => ['reports', 'certificate', appId] as const,
  },
} as const;
