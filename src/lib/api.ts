// API client and data fetching functions
// In production, replace these with actual API calls
// 
// To use a real API:
// 1. Set VITE_API_URL in your .env file (see env.example)
// 2. Replace the mock implementations below with calls to apiClient
//    Example: import { apiGet } from './apiClient';
//             const data = await apiGet('/dashboard/stats');

import { shouldUseMockData, getApiUrl } from '@/config/env';
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

import type { UserRole, Permission } from '@/types/auth';
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

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Dashboard API
// 
// Example: To use real API instead of mock data, replace the implementation like this:
// 
// export const dashboardApi = {
//   getStats: async (): Promise<DashboardStats> => {
//     if (shouldUseMockData()) {
//       // Fallback to mock data if API URL not configured
//       await delay(500);
//       return { ...mock data... };
//     }
//     return await apiGet<DashboardStats>('/dashboard/stats');
//   },
// };
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    await delay(500);
    return {
      totalTemplates: 12,
      publishedPages: 8,
      totalUsers: 24,
      completionRate: 87,
    };
  },

  getRecentActivity: async (): Promise<Activity[]> => {
    await delay(500);
    return [
      { id: '1', action: 'Template "Employee Form" created', time: '2 hours ago', icon: 'MdDescription' },
      { id: '2', action: 'Page "Contact Us" published', time: '5 hours ago', icon: 'MdCheckCircle' },
      { id: '3', action: 'User "john@example.com" added', time: '1 day ago', icon: 'MdPeople' },
      { id: '4', action: 'Template "Survey" updated', time: '2 days ago', icon: 'MdAccessTime' },
    ];
  },
};

// Pages API
export const pagesApi = {
  getAll: async (): Promise<Page[]> => {
    await delay(500);
    
    // Get from localStorage first (for templates and pages)
    const savedPages = localStorage.getItem('landadmin-pages');
    if (savedPages) {
      try {
        const pages: Page[] = JSON.parse(savedPages);
        // Merge with default pages for demo
        const defaultPages: Page[] = [
          {
            id: '1',
            title: 'Contact Form',
            slug: '/contact',
            status: 'published',
            updatedAt: '2 hours ago',
            views: 245,
            templateId: 'template-1',
            elements: [],
            publishedAt: '2024-01-15T10:00:00Z',
            createdBy: 'user-1',
            isTemplate: false,
            isNamed: true,
          },
          {
            id: '2',
            title: 'Employee Registration',
            slug: '/employee-form',
            status: 'published',
            updatedAt: '1 day ago',
            views: 189,
            templateId: 'template-2',
            elements: [],
            publishedAt: '2024-01-14T10:00:00Z',
            createdBy: 'user-1',
            isTemplate: false,
            isNamed: true,
          },
        ];
        return [...pages, ...defaultPages.filter(p => !pages.find(sp => sp.id === p.id))];
      } catch (error) {
        console.error('Failed to parse saved pages:', error);
      }
    }
    
    // Return default pages
    return [
      {
        id: '1',
        title: 'Contact Form',
        slug: '/contact',
        status: 'published',
        updatedAt: '2 hours ago',
        views: 245,
        templateId: 'template-1',
        elements: [],
        publishedAt: '2024-01-15T10:00:00Z',
        createdBy: 'user-1',
        isTemplate: false,
        isNamed: true,
      },
      {
        id: '2',
        title: 'Employee Registration',
        slug: '/employee-form',
        status: 'published',
        updatedAt: '1 day ago',
        views: 189,
        templateId: 'template-2',
        elements: [],
        publishedAt: '2024-01-14T10:00:00Z',
        createdBy: 'user-1',
        isTemplate: false,
        isNamed: true,
      },
      {
        id: '3',
        title: 'Customer Survey',
        slug: '/survey',
        status: 'draft',
        updatedAt: '3 days ago',
        views: 0,
        templateId: 'template-3',
        elements: [],
        createdBy: 'user-2',
        isTemplate: false,
        isNamed: true,
      },
      {
        id: '4',
        title: 'Application Form',
        slug: '/application',
        status: 'published',
        updatedAt: '1 week ago',
        views: 432,
        templateId: 'template-4',
        elements: [],
        publishedAt: '2024-01-08T10:00:00Z',
        createdBy: 'user-1',
        isTemplate: false,
        isNamed: true,
      },
    ];
  },

  create: async (data: Partial<Page>): Promise<Page> => {
    await delay(800);
    const newPage: Page = {
      id: crypto.randomUUID(),
      title: data.title || 'New Page',
      slug: data.slug || '/new-page',
      status: data.status || 'draft',
      updatedAt: 'Just now',
      views: 0,
      templateId: data.templateId,
      elements: data.elements || [],
      publishedAt: data.status === 'published' ? new Date().toISOString() : undefined,
      createdBy: data.createdBy,
      isTemplate: data.isTemplate ?? false,
      isNamed: data.isNamed ?? (!!data.title),
      templateIds: data.templateIds,
      description: data.description,
      category: data.category,
    };
    
    // Save to localStorage
    const savedPages = localStorage.getItem('landadmin-pages');
    const pages: Page[] = savedPages ? JSON.parse(savedPages) : [];
    pages.push(newPage);
    localStorage.setItem('landadmin-pages', JSON.stringify(pages));
    
    return newPage;
  },

  // Save a template (auto-saved from builder)
  saveTemplate: async (elements: FormElement[], userId?: string, title?: string): Promise<Page> => {
    await delay(500);
    const templateId = crypto.randomUUID();
    const templateTitle = title && title.trim().length > 0 ? title.trim() : 'Unnamed Template';
    const slugBase = templateTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const newTemplate: Page = {
      id: templateId,
      title: templateTitle,
      slug: `/${slugBase || `template-${templateId.substring(0, 8)}`}`,
      status: 'draft',
      updatedAt: 'Just now',
      views: 0,
      elements,
      isTemplate: true,
      isNamed: false,
      createdBy: userId,
    };
    
    // Save to localStorage
    const savedPages = localStorage.getItem('landadmin-pages');
    const pages: Page[] = savedPages ? JSON.parse(savedPages) : [];
    pages.push(newTemplate);
    localStorage.setItem('landadmin-pages', JSON.stringify(pages));
    
    return newTemplate;
  },

  // Link templates together and name the page
  linkTemplates: async (templateIds: string[], pageData: { title: string; slug: string; description?: string; status?: 'published' | 'draft'; category?: string }): Promise<Page> => {
    await delay(800);
    
    // Get all templates
    const savedPages = localStorage.getItem('landadmin-pages');
    const pages: Page[] = savedPages ? JSON.parse(savedPages) : [];
    
    // Get templates to link in the specified order
    const templates: Page[] = [];
    templateIds.forEach(id => {
      const template = pages.find(p => p.id === id && p.isTemplate);
      if (template) {
        templates.push(template);
      }
    });
    
    // Combine all elements from templates in order
    const combinedElements: FormElement[] = [];
    templates.forEach(template => {
      combinedElements.push(...(template.elements || []));
    });
    
    // Create new page from linked templates
    const newPage: Page = {
      id: crypto.randomUUID(),
      title: pageData.title,
      slug: pageData.slug,
      status: pageData.status || 'draft',
      updatedAt: 'Just now',
      views: 0,
      elements: combinedElements,
      isTemplate: false,
      isNamed: true,
      templateIds, // Preserve order
      description: pageData.description,
      category: pageData.category,
      publishedAt: pageData.status === 'published' ? new Date().toISOString() : undefined,
    };
    
    // Update templates to mark them as named
    const updatedPages = pages.map(p => {
      if (templateIds.includes(p.id)) {
        return { ...p, isNamed: true };
      }
      return p;
    });
    
    // Add new page
    updatedPages.push(newPage);
    localStorage.setItem('landadmin-pages', JSON.stringify(updatedPages));
    
    return newPage;
  },

  delete: async (id: string): Promise<void> => {
    await delay(500);
    // Delete from localStorage
    const savedPages = localStorage.getItem('landadmin-pages');
    if (savedPages) {
      try {
        const pages: Page[] = JSON.parse(savedPages);
        const filtered = pages.filter(p => p.id !== id);
        localStorage.setItem('landadmin-pages', JSON.stringify(filtered));
      } catch (error) {
        console.error('Failed to delete page from localStorage:', error);
      }
    }
    // In production, this would delete from the database
  },

  getById: async (id: string): Promise<Page> => {
    await delay(500);
    // In production, fetch from database
    const allPages = await pagesApi.getAll();
    const page = allPages.find(p => p.id === id);
    if (page) return page;
    // Fallback if not found
    return {
      id,
      title: 'Page',
      slug: '/page',
      status: 'draft',
      updatedAt: 'Just now',
      views: 0,
      elements: [],
    };
  },

  publishPage: async (pageId: string, elements: FormElement[]): Promise<Page> => {
    await delay(800);
    // In production, update page in database
    return {
      id: pageId,
      title: 'Published Page',
      slug: '/published',
      status: 'published',
      updatedAt: 'Just now',
      views: 0,
      elements,
      publishedAt: new Date().toISOString(),
    };
  },

  updatePageTemplate: async (pageId: string, elements: FormElement[]): Promise<Page> => {
    await delay(800);
    // In production, update page template in database
    return {
      id: pageId,
      title: 'Updated Page',
      slug: '/updated',
      status: 'published',
      updatedAt: 'Just now',
      views: 0,
      elements,
    };
  },

  getPageTemplate: async (pageId: string): Promise<FormElement[]> => {
    await delay(500);
    // In production, fetch template elements from database
    return [];
  },

  unpublishPage: async (pageId: string): Promise<void> => {
    await delay(500);
    // In production, update page status to draft
  },

  duplicatePage: async (pageId: string): Promise<Page> => {
    await delay(800);
    // In production, duplicate page in database
    return {
      id: crypto.randomUUID(),
      title: 'Copied Page',
      slug: '/copied',
      status: 'draft',
      updatedAt: 'Just now',
      views: 0,
      elements: [],
    };
  },

  getPublishedPages: async (): Promise<Page[]> => {
    await delay(500);
    // In production, fetch only published pages
    const allPages = await pagesApi.getAll();
    return allPages.filter(page => page.status === 'published');
  },
};

// 2FA API
export const twoFactorApi = {
  sendCode: async (email: string): Promise<void> => {
    await delay(1000);
    // In production, send 6-digit code via email
    // For demo, store code in sessionStorage
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(`2fa-code-${email}`, code);
    console.log('2FA Code (demo):', code);
  },

  verifyCode: async (email: string, code: string): Promise<boolean> => {
    await delay(500);
    // In production, verify code from database
    const storedCode = sessionStorage.getItem(`2fa-code-${email}`);
    return storedCode === code;
  },

  enable: async (userId: string): Promise<{ secret: string }> => {
    await delay(800);
    // In production, enable 2FA and return secret
    return { secret: 'demo-secret-key' };
  },

  disable: async (userId: string): Promise<void> => {
    await delay(500);
    // In production, disable 2FA
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    await delay(500);
    
    // Try to get from localStorage first
    const savedUsers = localStorage.getItem('landadmin-users');
    if (savedUsers) {
      try {
        const users: User[] = JSON.parse(savedUsers);
        // Ensure all users have permissions
        return users.map(user => ({
          ...user,
          permissions: user.permissions || getDefaultPermissionsForRole(user.role),
        }));
      } catch (error) {
        console.error('Failed to parse saved users:', error);
      }
    }
    
    // Default demo users
    return [
      {
        id: '1',
        name: 'John Doe',
        email: 'admin@demo.com',
        role: 'admin' as UserRole,
        status: 'active',
        joinedAt: '2024-01-15',
        permissions: getDefaultPermissionsForRole('admin'),
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'user@demo.com',
        role: 'user' as UserRole,
        status: 'active',
        joinedAt: '2024-02-20',
        permissions: getDefaultPermissionsForRole('user'),
      },
    ];
  },

  create: async (data: Partial<User>): Promise<User> => {
    await delay(800);
    
    const newUser: User = {
      id: crypto.randomUUID(),
      name: data.name || 'New User',
      email: data.email || 'newuser@example.com',
      role: (data.role || 'user') as UserRole,
      status: data.status || 'active',
      joinedAt: new Date().toISOString(),
      permissions: data.permissions || getDefaultPermissionsForRole((data.role || 'user') as UserRole),
    };
    
    // Save to localStorage
    const savedUsers = localStorage.getItem('landadmin-users');
    const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];
    users.push(newUser);
    localStorage.setItem('landadmin-users', JSON.stringify(users));
    
    return newUser;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    await delay(800);
    
    const savedUsers = localStorage.getItem('landadmin-users');
    if (!savedUsers) {
      throw new Error('User not found');
    }
    
    const users: User[] = JSON.parse(savedUsers);
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...users[userIndex],
      ...data,
      permissions: data.permissions || users[userIndex].permissions,
    };
    
    users[userIndex] = updatedUser;
    localStorage.setItem('landadmin-users', JSON.stringify(users));
    
    // If this is the currently logged-in user, update their session
    const currentUser = localStorage.getItem('landadmin-user');
    if (currentUser) {
      try {
        const parsedUser = JSON.parse(currentUser);
        if (parsedUser.id === id) {
          localStorage.setItem('landadmin-user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error('Failed to update current user session:', error);
      }
    }
    
    return updatedUser;
  },

  delete: async (id: string): Promise<void> => {
    await delay(500);
    
    const savedUsers = localStorage.getItem('landadmin-users');
    if (savedUsers) {
      const users: User[] = JSON.parse(savedUsers);
      const filtered = users.filter(u => u.id !== id);
      localStorage.setItem('landadmin-users', JSON.stringify(filtered));
    }
  },
};

// Mock data stores
let mockPayments: Payment[] = [];
let mockApplications: Application[] = [];
let mockAllocations: Allocation[] = [];
let mockExpenses: Expense[] = [];

// Initialize mock data
const initializeMockData = () => {
  const now = new Date();
  const userId = '1'; // Default user ID

  // Mock Payments
  mockPayments = [
    {
      id: 'pay-1',
      userId: '1',
      applicationId: 'app-1',
      amount: 5000,
      currency: 'NGN',
      status: 'paid',
      paymentMethod: 'online',
      transactionId: 'txn_123456',
      paidAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Application Fee',
      feeType: 'application_fee',
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'pay-2',
      userId: '1',
      applicationId: 'app-2',
      amount: 3000,
      currency: 'NGN',
      status: 'pending',
      paymentMethod: 'online',
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Processing Fee',
      feeType: 'processing_fee',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'pay-3',
      userId: '2',
      applicationId: 'app-3',
      amount: 7500,
      currency: 'NGN',
      status: 'paid',
      paymentMethod: 'bank_transfer',
      transactionId: 'txn_789012',
      paidAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Allocation Fee',
      feeType: 'allocation_fee',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Mock Applications
  mockApplications = [
    {
      id: 'app-1',
      userId: '1',
      type: 'land_allocation',
      status: 'approved',
      submittedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      reviewedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      approvedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
      title: 'Land Allocation Request - Parcel A',
      description: 'Request for land allocation in Zone 1',
      applicant: {
        type: 'person',
        id: 'appl-001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0101',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        occupation: 'Business Owner',
      },
      applicantName: 'John Doe',
      applicantEmail: 'john.doe@example.com',
      applicantPhone: '+1-555-0101',
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'app-2',
      userId: '1',
      type: 'resource_allocation',
      status: 'under_review',
      submittedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      reviewedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      title: 'Resource Allocation Request',
      description: 'Request for resource allocation',
      applicant: {
        type: 'company',
        id: 'appl-002',
        companyName: 'Acme Corporation',
        registrationNumber: 'REG-12345',
        taxId: 'TAX-98765',
        email: 'info@acmecorp.com',
        phone: '+1-555-0202',
        website: 'https://acmecorp.com',
        address: '456 Business Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
        contactPerson: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@acmecorp.com',
          phone: '+1-555-0203',
          position: 'Operations Manager',
        },
        industry: 'Technology',
        yearEstablished: 2010,
      },
      applicantName: 'Acme Corporation',
      applicantEmail: 'info@acmecorp.com',
      applicantPhone: '+1-555-0202',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'app-3',
      userId: '2',
      type: 'land_allocation',
      status: 'submitted',
      submittedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'low',
      title: 'Land Allocation Request - Parcel B',
      description: 'Request for land allocation in Zone 2',
      applicant: {
        type: 'person',
        id: 'appl-003',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0303',
        address: '789 Oak Street',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        occupation: 'Architect',
      },
      applicantName: 'Jane Smith',
      applicantEmail: 'jane.smith@example.com',
      applicantPhone: '+1-555-0303',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Mock Allocations
  mockAllocations = [
    {
      id: 'alloc-1',
      applicationId: 'app-1',
      userId: '1',
      type: 'land',
      status: 'allocated',
      location: 'Zone 1, Block A',
      parcelNumber: 'P-001',
      size: '500 sq meters',
      allocatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      details: { zone: 'Zone 1', block: 'A' },
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'alloc-2',
      applicationId: 'app-2',
      userId: '1',
      type: 'resource',
      status: 'pending',
      location: 'Resource Center',
      details: { resourceType: 'Equipment' },
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'alloc-3',
      applicationId: 'app-1',
      userId: '1',
      type: 'land',
      status: 'completed',
      location: 'Zone 1, Block B',
      parcelNumber: 'P-002',
      size: '300 sq meters',
      allocatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      details: { zone: 'Zone 1', block: 'B' },
      createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Mock Expenses (derived from payments)
  mockExpenses = mockPayments.map((payment) => ({
    id: `exp-${payment.id}`,
    userId: payment.userId,
    type: payment.feeType,
    amount: payment.amount,
    date: payment.paidAt || payment.createdAt,
    status: payment.status,
    paymentId: payment.id,
    description: payment.description,
    createdAt: payment.createdAt,
  }));
};

// Initialize on first load
initializeMockData();

// Payments API
export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    await delay(500);
    return [...mockPayments];
  },

  getByUserId: async (userId: string): Promise<Payment[]> => {
    await delay(500);
    return mockPayments.filter((p) => p.userId === userId);
  },

  getByApplicationId: async (applicationId: string): Promise<Payment[]> => {
    await delay(500);
    return mockPayments.filter((p) => p.applicationId === applicationId);
  },

  getById: async (id: string): Promise<Payment | undefined> => {
    await delay(500);
    return mockPayments.find((p) => p.id === id);
  },

  create: async (data: Partial<Payment>): Promise<Payment> => {
    await delay(800);
    const newPayment: Payment = {
      id: crypto.randomUUID(),
      userId: data.userId || '',
      applicationId: data.applicationId,
      amount: data.amount || 0,
      currency: data.currency || 'NGN',
      status: data.status || 'pending',
      paymentMethod: data.paymentMethod || 'online',
      transactionId: data.transactionId,
      paidAt: data.paidAt,
      dueDate: data.dueDate || new Date().toISOString(),
      description: data.description || '',
      feeType: data.feeType || 'other',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockPayments.push(newPayment);
    return newPayment;
  },

  updateStatus: async (id: string, status: Payment['status'], notes?: string): Promise<Payment> => {
    await delay(800);
    const index = mockPayments.findIndex((p) => p.id === id);
    if (index !== -1) {
      const updated = {
        ...mockPayments[index],
        status,
        notes: notes || mockPayments[index].notes,
        updatedAt: new Date().toISOString(),
        paidAt: status === 'paid' && !mockPayments[index].paidAt ? new Date().toISOString() : mockPayments[index].paidAt,
      };
      mockPayments[index] = updated;
      return updated;
    }
    throw new Error('Payment not found');
  },

  getSummary: async (userId?: string): Promise<PaymentSummary> => {
    await delay(500);
    const payments = userId ? mockPayments.filter((p) => p.userId === userId) : mockPayments;
    return {
      total: payments.reduce((sum, p) => sum + p.amount, 0),
      paid: payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
      pending: payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      failed: payments.filter((p) => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0),
      refunded: payments.filter((p) => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0),
    };
  },
};

// Applications API
export const applicationsApi = {
  getAll: async (): Promise<Application[]> => {
    await delay(500);
    return [...mockApplications];
  },

  getByUserId: async (userId: string): Promise<Application[]> => {
    await delay(500);
    return mockApplications.filter((a) => a.userId === userId);
  },

  getById: async (id: string): Promise<Application | undefined> => {
    await delay(500);
    return mockApplications.find((a) => a.id === id);
  },

  create: async (data: Partial<Application>): Promise<Application> => {
    await delay(800);
    
    // Extract applicant data from formData if available
    let applicant = data.applicant;
    if (!applicant && data.formData) {
      applicant = extractApplicantFromFormData(data.formData);
    }
    
    const newApp: Application = {
      id: crypto.randomUUID(),
      userId: data.userId || '',
      pageId: data.pageId,
      type: data.type || 'land_allocation',
      status: data.status || 'draft',
      submittedAt: data.submittedAt,
      reviewedAt: data.reviewedAt,
      approvedAt: data.approvedAt,
      rejectedAt: data.rejectedAt,
      rejectionReason: data.rejectionReason,
      priority: data.priority || 'medium',
      title: data.title || 'New Application',
      description: data.description,
      formData: data.formData,
      applicant,
      applicantName: data.applicantName || (applicant ? getApplicantName(applicant) : undefined),
      applicantEmail: data.applicantEmail || (applicant ? getApplicantEmail(applicant) : undefined),
      applicantPhone: data.applicantPhone || (applicant ? getApplicantPhone(applicant) : undefined),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockApplications.push(newApp);
    return newApp;
  },

  submitApplication: async (pageId: string, userId: string, formData: Record<string, any>, status: 'draft' | 'submitted' = 'submitted'): Promise<Application> => {
    await delay(800);
    // Get page to extract title
    const page = await pagesApi.getById(pageId);
    const now = new Date().toISOString();
    
    // Extract applicant data from formData
    const applicant = extractApplicantFromFormData(formData);
    
    const newApp: Application = {
      id: crypto.randomUUID(),
      userId,
      pageId,
      type: 'land_allocation', // Default type, can be inferred from form data
      status,
      submittedAt: status === 'submitted' ? now : undefined,
      priority: 'medium',
      title: page.title || 'Application',
      description: `Application submitted from ${page.title}`,
      formData,
      applicant,
      applicantName: applicant ? getApplicantName(applicant) : undefined,
      applicantEmail: applicant ? getApplicantEmail(applicant) : undefined,
      applicantPhone: applicant ? getApplicantPhone(applicant) : undefined,
      createdAt: now,
      updatedAt: now,
    };
    mockApplications.push(newApp);
    return newApp;
  },

  getByPageId: async (pageId: string, userId?: string): Promise<Application[]> => {
    await delay(500);
    let apps = mockApplications.filter((a) => a.pageId === pageId);
    if (userId) {
      apps = apps.filter((a) => a.userId === userId);
    }
    return apps;
  },

  updateStatus: async (
    id: string,
    status: Application['status'],
    rejectionReason?: string
  ): Promise<Application> => {
    await delay(800);
    const index = mockApplications.findIndex((a) => a.id === id);
    if (index !== -1) {
      const now = new Date().toISOString();
      const updated: Application = {
        ...mockApplications[index],
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
        reviewedAt: status !== 'draft' && status !== 'submitted' ? now : mockApplications[index].reviewedAt,
        approvedAt: status === 'approved' ? now : mockApplications[index].approvedAt,
        rejectedAt: status === 'rejected' ? now : mockApplications[index].rejectedAt,
        updatedAt: now,
      };
      mockApplications[index] = updated;
      return updated;
    }
    throw new Error('Application not found');
  },

  getStatusHistory: async (applicationId: string): Promise<ApplicationStatusHistory[]> => {
    await delay(500);
    const app = mockApplications.find((a) => a.id === applicationId);
    if (!app) return [];
    // Generate history from application data
    const history: ApplicationStatusHistory[] = [];
    if (app.submittedAt) {
      history.push({
        id: crypto.randomUUID(),
        applicationId,
        status: 'submitted',
        changedBy: app.userId,
        changedAt: app.submittedAt,
      });
    }
    if (app.reviewedAt) {
      history.push({
        id: crypto.randomUUID(),
        applicationId,
        status: 'under_review',
        changedBy: 'admin',
        changedAt: app.reviewedAt,
      });
    }
    if (app.approvedAt) {
      history.push({
        id: crypto.randomUUID(),
        applicationId,
        status: 'approved',
        changedBy: 'admin',
        changedAt: app.approvedAt,
      });
    }
    return history;
  },

  getStats: async (userId?: string): Promise<ApplicationStats> => {
    await delay(500);
    const apps = userId ? mockApplications.filter((a) => a.userId === userId) : mockApplications;
    return {
      total: apps.length,
      draft: apps.filter((a) => a.status === 'draft').length,
      submitted: apps.filter((a) => a.status === 'submitted').length,
      under_review: apps.filter((a) => a.status === 'under_review').length,
      approved: apps.filter((a) => a.status === 'approved').length,
      rejected: apps.filter((a) => a.status === 'rejected').length,
    };
  },
};

// Allocations API
export const allocationsApi = {
  getAll: async (): Promise<Allocation[]> => {
    await delay(500);
    return [...mockAllocations];
  },

  getByUserId: async (userId: string): Promise<Allocation[]> => {
    await delay(500);
    return mockAllocations.filter((a) => a.userId === userId);
  },

  getByApplicationId: async (applicationId: string): Promise<Allocation[]> => {
    await delay(500);
    return mockAllocations.filter((a) => a.applicationId === applicationId);
  },

  getById: async (id: string): Promise<Allocation | undefined> => {
    await delay(500);
    return mockAllocations.find((a) => a.id === id);
  },

  create: async (data: Partial<Allocation>): Promise<Allocation> => {
    await delay(800);
    const newAlloc: Allocation = {
      id: crypto.randomUUID(),
      applicationId: data.applicationId || '',
      userId: data.userId || '',
      type: data.type || 'land',
      status: data.status || 'pending',
      location: data.location || '',
      parcelNumber: data.parcelNumber,
      size: data.size,
      allocatedAt: data.allocatedAt,
      completedAt: data.completedAt,
      cancelledAt: data.cancelledAt,
      details: data.details,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAllocations.push(newAlloc);
    return newAlloc;
  },

  updateStatus: async (id: string, status: Allocation['status']): Promise<Allocation> => {
    await delay(800);
    const index = mockAllocations.findIndex((a) => a.id === id);
    if (index !== -1) {
      const now = new Date().toISOString();
      const updated: Allocation = {
        ...mockAllocations[index],
        status,
        allocatedAt: status === 'allocated' && !mockAllocations[index].allocatedAt ? now : mockAllocations[index].allocatedAt,
        completedAt: status === 'completed' ? now : mockAllocations[index].completedAt,
        cancelledAt: status === 'cancelled' ? now : mockAllocations[index].cancelledAt,
        updatedAt: now,
      };
      mockAllocations[index] = updated;
      return updated;
    }
    throw new Error('Allocation not found');
  },

  getStats: async (userId?: string): Promise<AllocationStats> => {
    await delay(500);
    const allocs = userId ? mockAllocations.filter((a) => a.userId === userId) : mockAllocations;
    return {
      total: allocs.length,
      pending: allocs.filter((a) => a.status === 'pending').length,
      allocated: allocs.filter((a) => a.status === 'allocated').length,
      completed: allocs.filter((a) => a.status === 'completed').length,
      cancelled: allocs.filter((a) => a.status === 'cancelled').length,
    };
  },
};

// Expenses API
export const expensesApi = {
  getByUserId: async (userId: string): Promise<Expense[]> => {
    await delay(500);
    return mockExpenses.filter((e) => e.userId === userId);
  },

  getByDateRange: async (userId: string, startDate: string, endDate: string): Promise<Expense[]> => {
    await delay(500);
    return mockExpenses.filter(
      (e) =>
        e.userId === userId &&
        e.date >= startDate &&
        e.date <= endDate
    );
  },

  getChartData: async (userId: string, days: number = 30): Promise<ExpenseChartData[]> => {
    await delay(500);
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    const expenses = mockExpenses.filter(
      (e) => e.userId === userId && e.date >= startDate.toISOString() && e.date <= endDate.toISOString()
    );
    return expenses.map((e) => ({
      date: e.date,
      amount: e.amount,
      type: e.type,
    }));
  },

  getSummary: async (userId: string, days: number = 30): Promise<ExpenseSummary> => {
    await delay(500);
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    const expenses = mockExpenses.filter(
      (e) => e.userId === userId && e.date >= startDate.toISOString() && e.date <= endDate.toISOString()
    );

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    expenses.forEach((e) => {
      byType[e.type] = (byType[e.type] || 0) + e.amount;
      byStatus[e.status] = (byStatus[e.status] || 0) + e.amount;
    });

    return {
      total: expenses.reduce((sum, e) => sum + e.amount, 0),
      byType: byType as ExpenseSummary['byType'],
      byStatus: byStatus as ExpenseSummary['byStatus'],
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    };
  },
};

// Dashboard API Extensions
export const userDashboardApi = {
  getStats: async (userId: string): Promise<UserDashboardStats> => {
    await delay(500);
    const [appStats, allocStats, paymentSummary, expenseSummary] = await Promise.all([
      applicationsApi.getStats(userId),
      allocationsApi.getStats(userId),
      paymentsApi.getSummary(userId),
      expensesApi.getSummary(userId),
    ]);

    const apps = await applicationsApi.getByUserId(userId);
    const completed = apps.filter((a) => a.status === 'approved' || a.status === 'rejected').length;

    return {
      applications: appStats,
      allocations: allocStats,
      payments: paymentSummary,
      expenses: expenseSummary,
      progress: {
        applicationsCompleted: completed,
        applicationsTotal: apps.length,
        completionRate: apps.length > 0 ? Math.round((completed / apps.length) * 100) : 0,
      },
    };
  },

  getProgressMetrics: async (userId: string): Promise<ProgressMetrics> => {
    await delay(500);
    const apps = await applicationsApi.getByUserId(userId);
    const payments = await paymentsApi.getByUserId(userId);
    const allocations = await allocationsApi.getByUserId(userId);

    const now = new Date();
    const overduePayments = payments.filter(
      (p) => p.status === 'pending' && new Date(p.dueDate) < now
    );

    return {
      applications: {
        submitted: apps.filter((a) => a.status === 'submitted').length,
        approved: apps.filter((a) => a.status === 'approved').length,
        rejected: apps.filter((a) => a.status === 'rejected').length,
        pending: apps.filter((a) => a.status === 'under_review').length,
      },
      payments: {
        paid: payments.filter((p) => p.status === 'paid').length,
        pending: payments.filter((p) => p.status === 'pending' && new Date(p.dueDate) >= now).length,
        overdue: overduePayments.length,
      },
      allocations: {
        allocated: allocations.filter((a) => a.status === 'allocated').length,
        pending: allocations.filter((a) => a.status === 'pending').length,
        completed: allocations.filter((a) => a.status === 'completed').length,
      },
    };
  },
};

// Reports API
export const reportsApi = {
  generateApprovalSheet: async (applicationId: string, allocationId?: string): Promise<string> => {
    await delay(1000);
    // In production, this would generate a PDF
    // For now, return a mock PDF data URL or blob URL
    // This will be implemented with jsPDF/html2canvas
    return 'mock-pdf-url';
  },

  generateStatusReport: async (applicationId: string): Promise<string> => {
    await delay(1000);
    // Generate status report PDF
    return 'mock-status-report-url';
  },

  generateAllocationsReport: async (applicationId: string): Promise<string> => {
    await delay(1000);
    // Generate allocations report PDF
    return 'mock-allocations-report-url';
  },

  generateBillInvoice: async (applicationId: string, type: 'bill' | 'invoice'): Promise<string> => {
    await delay(1000);
    // Generate bill or invoice PDF
    return `mock-${type}-url`;
  },

  generateCertificate: async (applicationId: string): Promise<string> => {
    await delay(1000);
    // Generate certificate PDF (only for approved applications)
    return 'mock-certificate-url';
  },
};

