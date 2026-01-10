import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserRole, Permission } from '@/types/auth';
import { getDefaultPermissionsForRole, hasPermission } from '@/lib/permissions';

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
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('landadmin-user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Ensure user has role and permissions
        if (!parsed.role || (parsed.role !== 'admin' && parsed.role !== 'user')) {
          parsed.role = 'user';
        }
        if (!parsed.permissions) {
          parsed.permissions = getDefaultPermissionsForRole(parsed.role);
        }
        if (parsed.twoFactorEnabled === undefined) {
          parsed.twoFactorEnabled = false;
        }
        setUser(parsed);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Demo accounts with predefined roles
    const demoAccounts: Record<string, { role: UserRole; name: string }> = {
      'admin@demo.com': { role: 'admin', name: 'Admin User' },
      'user@demo.com': { role: 'user', name: 'Regular User' },
    };

    let role: UserRole = 'user';
    let name = email.split('@')[0];
    let userId = crypto.randomUUID();

    // Check if it's a demo account
    if (demoAccounts[email] && (password === 'demo123' || password === 'admin123' || password === 'user123')) {
      role = demoAccounts[email].role;
      name = demoAccounts[email].name;
      // Use consistent ID for demo accounts
      userId = `demo-${email.split('@')[0]}`;
      
      // Load user from localStorage if it exists (for custom permissions)
      const savedUsers = localStorage.getItem('landadmin-users');
      if (savedUsers) {
        try {
          const users = JSON.parse(savedUsers);
          const savedUser = users.find((u: User) => u.email === email);
          if (savedUser) {
            setUser(savedUser);
            localStorage.setItem('landadmin-user', JSON.stringify(savedUser));
            return;
          }
        } catch (error) {
          console.error('Failed to parse saved users:', error);
        }
      }
    } else if (!demoAccounts[email]) {
      // For custom accounts, check if user exists in stored users
      const savedUsers = localStorage.getItem('landadmin-users');
      if (savedUsers) {
        try {
          const users = JSON.parse(savedUsers);
          const foundUser = users.find((u: User) => u.email === email);
          if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('landadmin-user', JSON.stringify(foundUser));
            return;
          }
        } catch (error) {
          console.error('Failed to parse saved users:', error);
        }
      }
      // Default to user role for new custom accounts
      role = 'user';
    } else {
      throw new Error('Invalid credentials');
    }

    const newUser: User = {
      id: userId,
      email,
      name,
      role,
      permissions: getDefaultPermissionsForRole(role),
      twoFactorEnabled: false,
    };
    
    setUser(newUser);
    localStorage.setItem('landadmin-user', JSON.stringify(newUser));
  };

  const updateUserPermissions = (userId: string, permissions: Permission) => {
    // Update in localStorage
    const savedUsers = localStorage.getItem('landadmin-users');
    if (savedUsers) {
      try {
        const users: User[] = JSON.parse(savedUsers);
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          users[userIndex].permissions = permissions;
          localStorage.setItem('landadmin-users', JSON.stringify(users));
          
          // If it's the current user, update state
          if (user?.id === userId) {
            setUser({ ...user, permissions });
            localStorage.setItem('landadmin-user', JSON.stringify({ ...user, permissions }));
          }
        }
      } catch (error) {
        console.error('Failed to update user permissions:', error);
      }
    }
  };

  const checkPermission = (resource: keyof Permission, action: string): boolean => {
    if (!user) return false;
    return hasPermission(user.permissions, resource, action);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('landadmin-user');
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

