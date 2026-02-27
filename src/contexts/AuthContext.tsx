import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserRole, Permission } from '@/types/auth';
import { getDefaultPermissionsForRole, hasPermission } from '@/lib/permissions';
import { authApi, meApi, usersApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission;
  twoFactorEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (resource: keyof Permission, action: string) => boolean;
  updateUserPermissions: (userId: string, permissions: Permission) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If a token exists, fetch current user from API
    const token = localStorage.getItem('auth_token');
    if (token) {
      meApi.getMe()
        .then((u) => setUser(u))
        .catch((err) => {
          console.error('Failed to fetch current user:', err);
          localStorage.removeItem('auth_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Call backend login endpoint
    const data = await authApi.login({ email, password });
    localStorage.setItem('auth_token', data.token);
    // set user from response (or fetch via /me)
    setUser(data.user as User);
  };

  const updateUserPermissions = async (userId: string, permissions: Permission) => {
    // call backend user update endpoint
    try {
      await usersApi.update(userId, { permissions });
      if (user?.id === userId) {
        setUser({ ...user, permissions });
      }
    } catch (err) {
      console.error('Failed to update user permissions:', err);
    }
  };

  const checkPermission = (resource: keyof Permission, action: string): boolean => {
    if (!user) return false;
    return hasPermission(user.permissions, resource, action);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission: checkPermission, updateUserPermissions }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

