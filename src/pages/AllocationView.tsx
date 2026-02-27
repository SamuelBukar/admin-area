import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { MdArrowBack, MdLocationOn, MdInfo, MdAssignment } from 'react-icons/md';
import { useAllocation, useUpdateAllocationStatus } from '@/hooks/useQueries';
import { EditAllocationStatusModal } from '@/components/modals/EditAllocationStatusModal';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { FaCalendar } from 'react-icons/fa';

export default function AllocationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();
  const { data: allocation, isLoading } = useAllocation(id || '');
  const updateStatus = useUpdateAllocationStatus();
  const [editOpen, setEditOpen] = useState(false);

  const canManageAllocations = hasPermission('allocations', 'manage');
  const isAdmin = user?.role === 'admin';

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      allocated: { variant: 'default' as const, label: 'Allocated' },
      completed: { variant: 'default' as const, label: 'Completed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' },
    };

    const { variant, label } = config[status as keyof typeof config] || { variant: 'outline' as const, label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!allocation) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Allocation not found</p>
            <Button onClick={() => navigate('/dashboard/allocations')} className="mt-4">
              <MdArrowBack className="w-4 h-4 mr-2" />
              Back to Allocations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Allocation Details | LandAdmin Builder</title>
        <meta name="description" content="View allocation details" />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/allocations')}
              className="mb-4"
            >
              <MdArrowBack className="w-4 h-4 mr-2" />
              Back to Allocations
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Allocation Details</h1>
            <p className="text-muted-foreground mt-2">View complete allocation information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <MdLocationOn className="w-5 h-5" />
                    Allocation Information
                  </CardTitle>
                  {isAdmin && canManageAllocations && (
                    <Button
                      variant="outline"
                      onClick={() => setEditOpen(true)}
                      disabled={updateStatus.isPending}
                    >
                      Edit Status
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Type</p>
                    <p className="text-lg font-semibold">
                      {allocation.type === 'land' ? 'Land Allocation' : 'Resource Allocation'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <div className="mt-1">{getStatusBadge(allocation.status)}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <p className="font-medium text-lg">{allocation.location}</p>
                  </div>
                  {allocation.parcelNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Parcel Number</p>
                      <p className="font-medium">{allocation.parcelNumber}</p>
                    </div>
                  )}
                  {allocation.size && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Size</p>
                      <p className="font-medium">{allocation.size}</p>
                    </div>
                  )}
                </div>

                {allocation.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <MdInfo className="w-4 h-4" />
                        Notes
                      </p>
                      <p className="text-sm">{allocation.notes}</p>
                    </div>
                  </>
                )}

                {allocation.details && Object.keys(allocation.details).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Additional Details</p>
                      <div className="space-y-2">
                        {Object.entries(allocation.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-sm text-muted-foreground capitalize">
                              {key.replace(/_/g, ' ')}:
                            </span>
                            <span className="text-sm font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaCalendar className="w-5 h-5" />
                  Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {allocation.allocatedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Allocated Date</p>
                    <p className="font-medium">
                      {format(new Date(allocation.allocatedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                {allocation.completedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Completed Date</p>
                    <p className="font-medium">
                      {format(new Date(allocation.completedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                {allocation.cancelledAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Cancelled Date</p>
                    <p className="font-medium">
                      {format(new Date(allocation.cancelledAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="font-medium">
                    {format(new Date(allocation.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                  <p className="font-medium">
                    {format(new Date(allocation.updatedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MdInfo className="w-5 h-5" />
                  Additional Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">User ID</p>
                  <p className="font-mono text-xs">{allocation.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Application ID</p>
                  <p className="font-mono text-xs">{allocation.applicationId}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {allocation && isAdmin && canManageAllocations && (
        <EditAllocationStatusModal
          open={editOpen}
          onOpenChange={setEditOpen}
          allocation={allocation}
          isLoading={updateStatus.isPending}
          onUpdate={(status, notes) => {
            updateStatus.mutate(
              { id: allocation.id, status, notes },
              { onSuccess: () => setEditOpen(false) }
            );
          }}
        />
      )}
    </>
  );
}

