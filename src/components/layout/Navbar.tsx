import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  MdMenu,
  MdDashboard, 
  MdSettings, 
  MdLogout,
  MdNotifications,
  MdSearch,
  MdLightMode,
  MdDarkMode,
} from 'react-icons/md';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { ALL_NAVIGATION_ITEMS, filterNavigationItems } from '@/config/navigation';

export const Navbar = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Filter navigation items using centralized config
  const navigationItems = filterNavigationItems(ALL_NAVIGATION_ITEMS, user?.role, hasPermission);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left Side - Mobile Menu Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <MdMenu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation menu</SheetTitle>
                <SheetDescription>Mobile navigation sidebar</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                {/* Logo/Brand */}
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-foreground">LA</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-sidebar-foreground">LandAdmin</h1>
                    <p className="text-xs text-muted-foreground">Builder Platform</p>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 pb-4 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Theme Toggle */}
                {mounted && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={toggleTheme}
                  >
                    {theme === 'dark' ? (
                      <>
                        <MdLightMode className="w-5 h-5 mr-2" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <MdDarkMode className="w-5 h-5 mr-2" />
                        Dark Mode
                      </>
                    )}
                  </Button>
                )}

                {/* Mobile Logout */}
                <Button
                  variant="outline"
                  className="w-full justify-start mt-4"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <MdLogout className="w-5 h-5 mr-2" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search pages, users, templates..."
              className="w-full pl-10 pr-4 h-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Right Side - User Menu */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hidden sm:flex"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <MdLightMode className="w-5 h-5" />
              ) : (
                <MdDarkMode className="w-5 h-5" />
              )}
            </Button>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <MdNotifications className="w-5 h-5" />
          </Button>

          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                <MdDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                <MdSettings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <MdLogout className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

