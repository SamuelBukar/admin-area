import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AllocationStats } from '@/types/allocation';
import { useTheme } from 'next-themes';

interface AllocationChartProps {
  data: AllocationStats;
  isLoading?: boolean;
}

export const AllocationChart = ({ data, isLoading }: AllocationChartProps) => {
  const { theme } = useTheme();

  const chartData = [
    {
      name: 'Allocations',
      Pending: data.pending,
      Allocated: data.allocated,
      Completed: data.completed,
      Cancelled: data.cancelled,
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Allocation Status</CardTitle>
          <CardDescription>Overview of allocation statuses</CardDescription>
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
        <CardTitle>Allocation Status</CardTitle>
        <CardDescription>Overview of allocation statuses</CardDescription>
      </CardHeader>
      <CardContent>
        {data.total === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No allocation data available</p>
          </div>
        ) : (
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
              <Bar dataKey="Pending" fill="#f59e0b" />
              <Bar dataKey="Allocated" fill="#8b5cf6" />
              <Bar dataKey="Completed" fill="#10b981" />
              <Bar dataKey="Cancelled" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

