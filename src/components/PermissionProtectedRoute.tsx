import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Permission } from '@/types/auth';

type PermissionKey = {
  resource: keyof Permission;
  action: string;
};

interface PermissionProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions: PermissionKey[];
  mode?: 'any' | 'all';
  redirectTo?: string;
}

export const PermissionProtectedRoute = ({
  children,
  requiredPermissions,
  mode = 'any',
  redirectTo = '/dashboard',
}: PermissionProtectedRouteProps) => {
  const { user, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const checks = requiredPermissions.map((p) => hasPermission(String(p.resource), p.action));
  const allowed = mode === 'all' ? checks.every(Boolean) : checks.some(Boolean);

  if (!allowed) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
};

