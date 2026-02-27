import type { UserRole, Permission } from '@/types/auth';

export const getDefaultPermissionsForRole = (role: UserRole): Permission => {
  const basePermissions: Permission = {
    pages: { view: false, create: false, edit: false, delete: false, publish: false },
    users: { create: false, edit: false, delete: false },
    templates: { create: false, edit: false, delete: false },
    settings: { view: false, edit: false },
    applications: { view: true, submit: true, edit: false },
    reports: { view: true, generate: true },
    payments: { view: true, manage: false },
    allocations: { view: true, manage: false },
  };

  switch (role) {
    case 'admin':
      // Admin gets full access to everything
      return {
        pages: { view: true, create: true, edit: true, delete: true, publish: true },
        users: { create: true, edit: true, delete: true },
        templates: { create: true, edit: true, delete: true },
        settings: { view: true, edit: true },
        applications: { view: true, submit: true, edit: true },
        reports: { view: true, generate: true },
        payments: { view: true, manage: true },
        allocations: { view: true, manage: true },
      };

    case 'user':
      // User gets limited permissions by default
      return {
        ...basePermissions,
        settings: { view: true, edit: false },
      };

    case 'editor':
      // Content editor-style access
      return {
        ...basePermissions,
        pages: { view: true, create: true, edit: true, delete: false, publish: true },
        templates: { create: true, edit: true, delete: true },
        settings: { view: true, edit: false },
        applications: { view: true, submit: true, edit: true },
      };

    case 'viewer':
      // Read-only access where applicable
      return {
        ...basePermissions,
        pages: { view: true, create: false, edit: false, delete: false, publish: false },
        templates: { create: false, edit: false, delete: false },
        settings: { view: true, edit: false },
        applications: { view: true, submit: false, edit: false },
        reports: { view: true, generate: false },
        payments: { view: true, manage: false },
        allocations: { view: true, manage: false },
      };

    case 'land_administrator':
      // Treat as admin-level access by default (backend can still override via explicit permissions)
      return getDefaultPermissionsForRole('admin');

    default:
      return basePermissions;
  }
};

// For backward compatibility
export const getPermissionsForRole = getDefaultPermissionsForRole;

export const checkPermission = (
  userRole: UserRole,
  resource: keyof Permission,
  action: string
): boolean => {
  const permissions = getPermissionsForRole(userRole);
  const resourcePermissions = permissions[resource];

  if (typeof resourcePermissions === 'object' && action in resourcePermissions) {
    return (resourcePermissions as any)[action] === true;
  }

  return false;
};

export const hasPermission = (
  permissions: Permission,
  resource: keyof Permission,
  action: string
): boolean => {
  const resourcePermissions = permissions[resource];

  if (typeof resourcePermissions === 'object' && action in resourcePermissions) {
    return (resourcePermissions as any)[action] === true;
  }

  return false;
};

