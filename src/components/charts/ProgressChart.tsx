import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ProgressMetrics } from '@/types/dashboard';
import { useTheme } from 'next-themes';

interface ProgressChartProps {
  data: ProgressMetrics;
  isLoading?: boolean;
}

export const ProgressChart = ({ data, isLoading }: ProgressChartProps) => {
  const { theme } = useTheme();

  const chartData = [
    {
      name: 'Applications',
      Submitted: data.applications.submitted,
      Approved: data.applications.approved,
      Rejected: data.applications.rejected,
      Pending: data.applications.pending,
    },
    {
      name: 'Payments',
      Paid: data.payments.paid,
      Pending: data.payments.pending,
      Overdue: data.payments.overdue,
    },
    {
      name: 'Allocations',
      Allocated: data.allocations.allocated,
      Pending: data.allocations.pending,
      Completed: data.allocations.completed,
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
          <CardDescription>Monitor your application and allocation progress</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Overview</CardTitle>
        <CardDescription>Monitor your application and allocation progress</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="name" 
              stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="Submitted" fill="#3b82f6" />
            <Bar dataKey="Approved" fill="#10b981" />
            <Bar dataKey="Rejected" fill="#ef4444" />
            <Bar dataKey="Pending" fill="#f59e0b" />
            <Bar dataKey="Paid" fill="#10b981" />
            <Bar dataKey="Overdue" fill="#ef4444" />
            <Bar dataKey="Allocated" fill="#8b5cf6" />
            <Bar dataKey="Completed" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

