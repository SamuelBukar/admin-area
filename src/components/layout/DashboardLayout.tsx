import { ReactNode } from 'react';
import { NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MdDashboard, 
  MdBuild, 
  MdPages, 
  MdPeople, 
  MdSettings,
  MdLogout,
  MdPayment,
  MdAssignment,
  MdDescription,
  MdDescription as MdApplications,
  MdFolderOpen
} from 'react-icons/md';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

interface SidebarItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const allSidebarItems: SidebarItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: MdDashboard },
  { path: '/dashboard/builder', label: 'Builder', icon: MdBuild, adminOnly: true },
  { path: '/dashboard/pages', label: 'Pages', icon: MdPages, adminOnly: true },
  { path: '/dashboard/applications', label: 'Applications', icon: MdApplications },
  { path: '/dashboard/my-applications', label: 'My Applications', icon: MdFolderOpen },
  { path: '/dashboard/payments', label: 'Payments', icon: MdPayment },
  { path: '/dashboard/allocations', label: 'Allocations', icon: MdAssignment },
  { path: '/dashboard/reports', label: 'Reports', icon: MdDescription },
  { path: '/dashboard/users', label: 'User Management', icon: MdPeople, adminOnly: true },
  { path: '/dashboard/settings', label: 'Settings', icon: MdSettings },
];

export const DashboardLayout = ({ children, hideSidebar = false }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const isBuilderPage = location.pathname === '/dashboard/builder';
  const shouldHideSidebar = hideSidebar || isBuilderPage;
  
  // Filter sidebar items based on user role and permissions
  const isAdmin = user?.role === 'admin';
  const sidebarItems = allSidebarItems.filter(item => {
    // Check admin-only items
    if (item.adminOnly && !isAdmin) return false;
    
    // For admin users, always show admin-only items (Pages, Builder, Users)
    if (isAdmin && item.adminOnly) return true;
    
    // Check permissions
    if (item.path === '/dashboard/builder' && !hasPermission('templates', 'create')) return false;
    if (item.path === '/dashboard/pages' && !hasPermission('pages', 'view')) return false;
    if (item.path === '/dashboard/users' && !hasPermission('users', 'create')) return false;
    if (item.path === '/dashboard/settings' && !hasPermission('settings', 'view')) return false;
    if (item.path === '/dashboard/applications' && !hasPermission('applications', 'view')) return false;
    if (item.path === '/dashboard/payments' && !hasPermission('payments', 'view')) return false;
    if (item.path === '/dashboard/allocations' && !hasPermission('allocations', 'view')) return false;
    if (item.path === '/dashboard/reports' && !hasPermission('reports', 'view')) return false;
    
    // For non-admin users, hide "Pages" and show "Applications" and "My Applications"
    if (!isAdmin) {
      if (item.path === '/dashboard/pages') return false;
      if (item.path === '/dashboard/builder') return false;
      if (item.path === '/dashboard/users') return false;
    } else {
      // For admin, show "Pages" but not "Applications" and "My Applications"
      if (item.path === '/dashboard/applications' || item.path === '/dashboard/my-applications') return false;
    }
    return true;
  });

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar - Full Height, Hidden on mobile, visible on lg+, hidden on builder page */}
      {!shouldHideSidebar && (
        <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border flex-col">
          {/* Logo/Brand at Top */}
          <div className="p-[0.6rem] border-b border-sidebar-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">LA</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">LandAdmin</h1>
                <p className="text-xs text-muted-foreground">Builder Platform</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <RouterNavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </>
                )}
              </RouterNavLink>
            ))}
          </nav>

          {/* User Section at Bottom */}
          <div className="border-t border-sidebar-border flex-shrink-0">
            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {user?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={handleLogout}
              >
                <MdLogout className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </aside>
      )}

      {/* Right Side - Navbar + Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navbar - Hidden on builder page */}
        {!isBuilderPage && <Navbar />}
        
        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto ${isBuilderPage ? 'bg-background' : 'bg-canvas'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

