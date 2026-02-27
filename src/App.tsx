import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PermissionProtectedRoute } from "@/components/PermissionProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load page components for code splitting
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Builder = lazy(() => import("./pages/Builder"));
const Preview = lazy(() => import("./pages/Preview"));
const PageView = lazy(() => import("./pages/PageView"));
const Pages = lazy(() => import("./pages/Pages"));
const CreateForm = lazy(() => import("./pages/CreateForm"));
const Payments = lazy(() => import("./pages/Payments"));
const PaymentView = lazy(() => import("./pages/PaymentView"));
const Allocations = lazy(() => import("./pages/Allocations"));
const AllocationView = lazy(() => import("./pages/AllocationView"));
const Reports = lazy(() => import("./pages/Reports"));
const ReportView = lazy(() => import("./pages/ReportView"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Settings = lazy(() => import("./pages/Settings"));
const UserApplications = lazy(() => import("./pages/UserApplications"));
const ApplicationForm = lazy(() => import("./pages/ApplicationForm"));
const MyApplications = lazy(() => import("./pages/MyApplications"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="p-6 lg:p-8 space-y-4">
    <Skeleton className="h-10 w-64" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Builder Route */}
              <Route
                path="/dashboard/builder"
                element={
                  <PermissionProtectedRoute
                    requiredPermissions={[{ resource: 'templates', action: 'create' }]}
                  >
                    <DashboardLayout>
                      <Builder />
                    </DashboardLayout>
                  </PermissionProtectedRoute>
                }
              />

              {/* Preview Route - No layout, full screen */}
              <Route
                path="/dashboard/preview"
                element={
                  <PermissionProtectedRoute
                    requiredPermissions={[{ resource: 'templates', action: 'create' }]}
                  >
                    <Preview />
                  </PermissionProtectedRoute>
                }
              />

              <Route
                path="/dashboard/pages"
                element={
                  <PermissionProtectedRoute
                    requiredPermissions={[{ resource: 'pages', action: 'view' }]}
                  >
                    <DashboardLayout>
                      <Pages />
                    </DashboardLayout>
                  </PermissionProtectedRoute>
                }
              />

              {/* Create Form Route */}
              <Route
                path="/dashboard/create-form"
                element={
                  <PermissionProtectedRoute
                    requiredPermissions={[{ resource: 'pages', action: 'create' }]}
                  >
                    <DashboardLayout>
                      <ErrorBoundary>
                        <CreateForm />
                      </ErrorBoundary>
                    </DashboardLayout>
                  </PermissionProtectedRoute>
                }
              />
              
              {/* Page View Route */}
              <Route
                path="/dashboard/pages/:id"
                element={
                  <PermissionProtectedRoute
                    requiredPermissions={[{ resource: 'pages', action: 'view' }]}
                  >
                    <DashboardLayout>
                      <PageView />
                    </DashboardLayout>
                  </PermissionProtectedRoute>
                }
              />
              
              <Route
                path="/dashboard/payments"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Payments />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/dashboard/payments/:id"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <PaymentView />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/dashboard/allocations"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Allocations />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/dashboard/allocations/:id"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AllocationView />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/dashboard/reports"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Reports />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/dashboard/reports/:id"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ReportView />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* User Management Route */}
              <Route
                path="/dashboard/users"
                element={
                  <PermissionProtectedRoute
                    requiredPermissions={[
                      { resource: 'users', action: 'create' },
                      { resource: 'users', action: 'edit' },
                      { resource: 'users', action: 'delete' },
                    ]}
                    mode="any"
                  >
                    <DashboardLayout>
                      <UserManagement />
                    </DashboardLayout>
                  </PermissionProtectedRoute>
                }
              />
              
              <Route
                path="/dashboard/settings"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* User Application Routes - Available to all authenticated users */}
              <Route
                path="/dashboard/applications"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <UserApplications />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/dashboard/applications/:pageId"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ApplicationForm />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/dashboard/my-applications"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <MyApplications />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/dashboard/my-applications/:id"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ReportView />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
