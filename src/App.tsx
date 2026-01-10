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
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load page components for code splitting
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Builder = lazy(() => import("./pages/Builder"));
const Preview = lazy(() => import("./pages/Preview"));
const PageView = lazy(() => import("./pages/PageView"));
const Pages = lazy(() => import("./pages/Pages"));
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
            <BrowserRouter>
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
              
              {/* Builder Route - Admin Only */}
              <Route
                path="/dashboard/builder"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <Builder />
                    </DashboardLayout>
                  </RoleProtectedRoute>
                }
              />

              {/* Preview Route - No layout, full screen */}
              <Route
                path="/dashboard/preview"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <Preview />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/dashboard/pages"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <Pages />
                    </DashboardLayout>
                  </RoleProtectedRoute>
                }
              />
              
              {/* Page View Route - Admin Only */}
              <Route
                path="/dashboard/pages/:id"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <PageView />
                    </DashboardLayout>
                  </RoleProtectedRoute>
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
              
              {/* User Management Route - Admin Only */}
              <Route
                path="/dashboard/users"
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <UserManagement />
                    </DashboardLayout>
                  </RoleProtectedRoute>
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
