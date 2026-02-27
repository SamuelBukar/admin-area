import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { 
  MdDescription, 
  MdPages, 
  MdPeople, 
  MdTrendingUp,
  MdAccessTime,
  MdCheckCircle,
  MdPayment,
  MdAssignment,
  MdManageAccounts,
  MdDescription as MdReport
} from 'react-icons/md';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useDashboardStats, 
  useRecentActivity,
  useUserDashboardStats,
  useProgressMetrics,
  useUserPayments,
  useUserAllocations,
  useApplicationStats,
  useAllocationStats,
  usePaymentSummary,
  useExpenseChart,
  usePayments
} from '@/hooks/useQueries';
import { CreatePageModal } from '@/components/modals/CreatePageModal';
import { CreateUserModal } from '@/components/modals/CreateUserModal';
import { GenerateApprovalSheetModal } from '@/components/modals/GenerateApprovalSheetModal';
import { ExpenseChart } from '@/components/charts/ExpenseChart';
import { ProgressChart } from '@/components/charts/ProgressChart';
import { PaymentStatusChart } from '@/components/charts/PaymentStatusChart';
import { AllocationChart } from '@/components/charts/AllocationChart';
import { StatusSection } from '@/components/dashboard/StatusSection';
import { useApplications, useAllocations } from '@/hooks/useQueries';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [createPageModalOpen, setCreatePageModalOpen] = useState(false);
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [approvalSheetModalOpen, setApprovalSheetModalOpen] = useState(false);
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity();
  
  // User dashboard data
  const userId = user?.id || '';
  const isAdmin = user?.role === 'admin';
  
  const { data: userStats, isLoading: userStatsLoading } = useUserDashboardStats(userId);
  const { data: progressMetrics, isLoading: progressLoading } = useProgressMetrics(userId);
  const { isLoading: paymentsLoading } = useUserPayments(userId);
  const { isLoading: allocationsLoading } = useUserAllocations(userId);
  const { data: applicationStats } = useApplicationStats(userId);
  const { data: allocationStats } = useAllocationStats(userId);
  const { data: paymentSummary } = usePaymentSummary(userId);
  const { data: expenseChartData, isLoading: expenseChartLoading } = useExpenseChart(userId, 30);
  
  // Management data (admin only)
  const { data: allApplications } = useApplications();
  const { data: allAllocations } = useAllocations();
  const { data: allPayments } = usePayments();
  
  // Get stats based on role
  const adminApplicationStats = useApplicationStats(); // All applications for admin
  const adminPaymentSummary = usePaymentSummary(); // All payments for admin
  
  // Use admin stats for admin, user stats for regular users
  const displayApplicationStats = isAdmin ? adminApplicationStats.data : applicationStats;
  const displayPaymentSummary = isAdmin ? adminPaymentSummary.data : paymentSummary;

  // Admin stats cards
  const adminStatCards = [
    {
      title: 'Total Templates',
      value: stats?.totalTemplates.toString() || '0',
      change: '+3 this week',
      icon: MdDescription,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Published Pages',
      value: stats?.publishedPages.toString() || '0',
      change: '+2 this week',
      icon: MdPages,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers.toString() || '0',
      change: '+5 this month',
      icon: MdPeople,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    {
      title: 'Completion Rate',
      value: `${stats?.completionRate || 0}%`,
      change: '+12% from last month',
      icon: MdTrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
  ];

  // User stats cards
  const userStatCards = [
    {
      title: 'My Applications',
      value: (displayApplicationStats?.submitted || 0) + (displayApplicationStats?.approved || 0) + (displayApplicationStats?.under_review || 0) + (displayApplicationStats?.draft || 0) + (displayApplicationStats?.rejected || 0),
      change: `${displayApplicationStats?.approved || 0} approved`,
      icon: MdAssignment,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Pending Payments',
      value: `₦${(displayPaymentSummary?.pending || 0).toLocaleString()}`,
      change: `₦${(displayPaymentSummary?.paid || 0).toLocaleString()} paid`,
      icon: MdPayment,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      title: 'Allocations',
      value: (allocationStats?.total || 0).toString(),
      change: `${allocationStats?.completed || 0} completed`,
      icon: MdManageAccounts,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    {
      title: 'Approval Rate',
      value: displayApplicationStats?.submitted 
        ? `${Math.round(((displayApplicationStats.approved || 0) / displayApplicationStats.submitted) * 100)}%`
        : '0%',
      change: `${displayApplicationStats?.approved || 0} approved`,
      icon: MdCheckCircle,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
  ];

  const statCards = isAdmin ? adminStatCards : userStatCards;

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'MdDescription': return MdDescription;
      case 'MdCheckCircle': return MdCheckCircle;
      case 'MdPeople': return MdPeople;
      case 'MdAccessTime': return MdAccessTime;
      default: return MdDescription;
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | LandAdmin Builder</title>
        <meta name="description" content="LandAdmin Builder Dashboard" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-canvas to-muted/20">
        <div className="p-6 lg:p-8 space-y-8 max-w-[1920px] mx-auto">
          {/* Header Section */}
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-muted-foreground text-lg">
                  {isAdmin 
                    ? 'Manage your land administration system and monitor user activities.'
                    : 'Here\'s what\'s happening with your applications, payments, and allocations today.'}
                </p>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <Button
                    onClick={() => navigate('/dashboard/builder')}
                    className="shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <MdDescription className="w-5 h-5 mr-2" />
                    New Template
                  </Button>
                )}
                {!isAdmin && (
                  <Button
                    onClick={() => navigate('/dashboard/applications')}
                    className="shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <MdDescription className="w-5 h-5 mr-2" />
                    Browse Applications
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-fade-in">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={stat.title}
                  className={`border-2 ${stat.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in bg-card`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                      <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Status Overview Section */}
          <StatusSection 
            applicationStats={displayApplicationStats}
            paymentSummary={displayPaymentSummary}
            isLoading={isAdmin ? adminApplicationStats.isLoading : userStatsLoading}
          />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            {expenseChartData && expenseChartData.length > 0 && (
              <ExpenseChart data={expenseChartData || []} isLoading={expenseChartLoading} />
            )}
            <ProgressChart 
              data={progressMetrics || { 
                applications: { submitted: 0, approved: 0, rejected: 0, pending: 0 }, 
                payments: { paid: 0, pending: 0, overdue: 0 }, 
                allocations: { allocated: 0, pending: 0, completed: 0 } 
              }} 
              isLoading={progressLoading} 
            />
            <PaymentStatusChart 
              data={displayPaymentSummary || { total: 0, paid: 0, pending: 0, failed: 0, refunded: 0 }} 
              isLoading={paymentsLoading} 
            />
            <AllocationChart 
              data={allocationStats || { total: 0, pending: 0, allocated: 0, completed: 0, cancelled: 0 }} 
              isLoading={allocationsLoading} 
            />
          </div>

          {/* Bottom Grid - Recent Activity and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
            {/* Recent Activity */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
                    <CardDescription className="mt-1">Your latest actions and updates</CardDescription>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MdAccessTime className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-6">
                {activitiesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities && activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.slice(0, 5).map((activity, index) => {
                      const Icon = getActivityIcon(activity.icon);
                      return (
                        <div 
                          key={activity.id} 
                          className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                              {activity.action}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                              <MdAccessTime className="w-3 h-3" />
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MdAccessTime className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                    <CardDescription className="mt-1">Get started with common tasks</CardDescription>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MdCheckCircle className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-6">
                <div className="space-y-3">
                  {/* Admin Quick Actions */}
                  {isAdmin && (
                    <>
                      {(hasPermission('templates', 'create')) && (
                        <button
                          onClick={() => navigate('/dashboard/builder')}
                          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 group bg-card"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <MdDescription className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Create New Template</p>
                            <p className="text-xs text-muted-foreground">Build a document or form</p>
                          </div>
                        </button>
                      )}

                      {(hasPermission('pages', 'create')) && (
                        <button
                          onClick={() => setCreatePageModalOpen(true)}
                          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-green-500 hover:bg-green-500/5 transition-all duration-200 group bg-card"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all">
                            <MdPages className="w-6 h-6 text-green-600 group-hover:text-white" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-sm font-semibold text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Create New Page</p>
                            <p className="text-xs text-muted-foreground">Add a new page to publish</p>
                          </div>
                        </button>
                      )}

                      {hasPermission('users', 'create') && (
                        <button
                          onClick={() => setCreateUserModalOpen(true)}
                          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-purple-500 hover:bg-purple-500/5 transition-all duration-200 group bg-card"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all">
                            <MdPeople className="w-6 h-6 text-purple-600 group-hover:text-white" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-sm font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Add Team Member</p>
                            <p className="text-xs text-muted-foreground">Invite a new user</p>
                          </div>
                        </button>
                      )}
                    </>
                  )}

                  {/* User Quick Actions */}
                  {!isAdmin && (
                    <>
                      <button
                        onClick={() => navigate('/dashboard/applications')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-200 group bg-card"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <MdDescription className="w-6 h-6 text-blue-600 group-hover:text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Browse Applications</p>
                          <p className="text-xs text-muted-foreground">View available application forms</p>
                        </div>
                      </button>

                      <button
                        onClick={() => navigate('/dashboard/my-applications')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-orange-500 hover:bg-orange-500/5 transition-all duration-200 group bg-card"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all">
                          <MdAssignment className="w-6 h-6 text-orange-600 group-hover:text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-semibold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">My Applications</p>
                          <p className="text-xs text-muted-foreground">View your submitted applications</p>
                        </div>
                      </button>

                      <button
                        onClick={() => navigate('/dashboard/reports')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-green-500 hover:bg-green-500/5 transition-all duration-200 group bg-card"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all">
                          <MdReport className="w-6 h-6 text-green-600 group-hover:text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-semibold text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Generate Reports</p>
                          <p className="text-xs text-muted-foreground">Create status and allocation reports</p>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreatePageModal open={createPageModalOpen} onOpenChange={setCreatePageModalOpen} />
      <CreateUserModal open={createUserModalOpen} onOpenChange={setCreateUserModalOpen} />
      {Array.isArray(allApplications) && Array.isArray(allAllocations) && Array.isArray(allPayments) && (
        <GenerateApprovalSheetModal
          open={approvalSheetModalOpen}
          onOpenChange={setApprovalSheetModalOpen}
          applications={allApplications}
          allocations={allAllocations}
          payments={allPayments}
        />
      )}
    </>
  );
};

export default Dashboard;
