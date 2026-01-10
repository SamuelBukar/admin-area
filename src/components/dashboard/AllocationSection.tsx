import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MdLocationOn, MdCheckCircle, MdPending, MdCancel } from 'react-icons/md';
import type { Allocation } from '@/types/allocation';
import { format } from 'date-fns';

interface AllocationSectionProps {
  allocations: Allocation[];
  isLoading?: boolean;
}

export const AllocationSection = ({ allocations, isLoading }: AllocationSectionProps) => {
  const [filter, setFilter] = useState<'all' | 'allocated' | 'pending'>('all');

  const filteredAllocations = useMemo(() => {
    if (filter === 'all') return allocations;
    if (filter === 'allocated') return allocations.filter((a) => a.status === 'allocated' || a.status === 'completed');
    return allocations.filter((a) => a.status === 'pending');
  }, [allocations, filter]);

  const getStatusBadge = (status: Allocation['status']) => {
    const config = {
      pending: { variant: 'secondary' as const, icon: MdPending, label: 'Pending' },
      allocated: { variant: 'default' as const, icon: MdCheckCircle, label: 'Allocated' },
      completed: { variant: 'default' as const, icon: MdCheckCircle, label: 'Completed' },
      cancelled: { variant: 'destructive' as const, icon: MdCancel, label: 'Cancelled' },
    };

    const { variant, icon: Icon, label } = config[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Allocations</CardTitle>
          <CardDescription>View your allocated land and resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocations</CardTitle>
        <CardDescription>View your allocated land and resources</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="allocated">Allocated</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredAllocations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No allocations found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAllocations.map((allocation) => (
              <div
                key={allocation.id}
                className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MdLocationOn className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {allocation.type === 'land' ? 'Land Allocation' : 'Resource Allocation'}
                      </h4>
                      <p className="text-sm text-muted-foreground">{allocation.location}</p>
                    </div>
                  </div>
                  {getStatusBadge(allocation.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {allocation.parcelNumber && (
                    <div>
                      <span className="text-muted-foreground">Parcel Number:</span>
                      <p className="font-medium">{allocation.parcelNumber}</p>
                    </div>
                  )}
                  {allocation.size && (
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <p className="font-medium">{allocation.size}</p>
                    </div>
                  )}
                  {allocation.allocatedAt && (
                    <div>
                      <span className="text-muted-foreground">Allocated:</span>
                      <p className="font-medium">{format(new Date(allocation.allocatedAt), 'MMM dd, yyyy')}</p>
                    </div>
                  )}
                  {allocation.completedAt && (
                    <div>
                      <span className="text-muted-foreground">Completed:</span>
                      <p className="font-medium">{format(new Date(allocation.completedAt), 'MMM dd, yyyy')}</p>
                    </div>
                  )}
                </div>

                {allocation.notes && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">{allocation.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

