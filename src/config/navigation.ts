import {
  MdDashboard,
  MdBuild,
  MdPages,
  MdPeople,
  MdSettings,
  MdPayment,
  MdAssignment,
  MdDescription,
  MdFolderOpen,
} from 'react-icons/md';
import type { UserRole } from '@/types/auth';

export interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  permissionKey?: {
    resource: 'pages' | 'users' | 'templates' | 'settings' | 'applications' | 'payments' | 'allocations' | 'reports';
    action: 'view' | 'create' | 'edit' | 'delete' | 'publish' | 'submit' | 'manage' | 'generate';
  };
  rolesExcluded?: UserRole[];
}

/**
 * All available navigation items
 */
export const ALL_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: MdDashboard,
  },
  {
    path: '/dashboard/builder',
    label: 'Builder',
    icon: MdBuild,
    permissionKey: { resource: 'templates', action: 'create' },
  },
  {
    path: '/dashboard/pages',
    label: 'Pages',
    icon: MdPages,
    permissionKey: { resource: 'pages', action: 'view' },
  },
  {
    path: '/dashboard/applications',
    label: 'Applications',
    icon: MdPages,
    permissionKey: { resource: 'applications', action: 'view' },
    rolesExcluded: ['admin'], // Hide for admins, show for users
  },
  {
    path: '/dashboard/my-applications',
    label: 'My Applications',
    icon: MdFolderOpen,
    permissionKey: { resource: 'applications', action: 'view' },
    rolesExcluded: ['admin'], // Hide for admins, show for users
  },
  {
    path: '/dashboard/payments',
    label: 'Payments',
    icon: MdPayment,
    permissionKey: { resource: 'payments', action: 'view' },
  },
  {
    path: '/dashboard/allocations',
    label: 'Allocations',
    icon: MdAssignment,
    permissionKey: { resource: 'allocations', action: 'view' },
  },
  {
    path: '/dashboard/reports',
    label: 'Reports',
    icon: MdDescription,
    permissionKey: { resource: 'reports', action: 'view' },
  },
  {
    path: '/dashboard/users',
    label: 'User Management',
    icon: MdPeople,
    permissionKey: { resource: 'users', action: 'create' },
  },
  {
    path: '/dashboard/settings',
    label: 'Settings',
    icon: MdSettings,
    permissionKey: { resource: 'settings', action: 'view' },
  },
];

/**
 * Filter navigation items based on user role and permissions
 * @param items - Navigation items to filter
 * @param userRole - User's role
 * @param hasPermission - Function to check if user has a specific permission
 * @returns Filtered navigation items
 */
export function filterNavigationItems(
  items: NavigationItem[],
  userRole: UserRole | undefined,
  hasPermission: (resource: string, action: string) => boolean
): NavigationItem[] {
  return items.filter((item) => {
    // Check if user role is excluded
    if (item.rolesExcluded?.includes(userRole || 'user')) {
      return false;
    }

    // Check permissions if specified
    if (item.permissionKey) {
      if (!hasPermission(item.permissionKey.resource, item.permissionKey.action)) {
        return false;
      }
    }

    return true;
  });
}
