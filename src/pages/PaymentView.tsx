import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { MdArrowBack, MdPayment, MdInfo } from 'react-icons/md';
import { usePayment, useUpdatePaymentStatus } from '@/hooks/useQueries';
import { EditPaymentStatusModal } from '@/components/modals/EditPaymentStatusModal';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { FaCalendar } from 'react-icons/fa';

export default function PaymentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();
  const { data: payment, isLoading } = usePayment(id || '');
  const updateStatus = useUpdatePaymentStatus();
  const [editOpen, setEditOpen] = useState(false);

  const canManagePayments = hasPermission('payments', 'manage');
  const isAdmin = user?.role === 'admin';

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'default',
      pending: 'secondary',
      failed: 'destructive',
      refunded: 'outline',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Payment not found</p>
            <Button onClick={() => navigate('/dashboard/payments')} className="mt-4">
              <MdArrowBack className="w-4 h-4 mr-2" />
              Back to Payments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payment Details | LandAdmin Builder</title>
        <meta name="description" content="View payment details" />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/payments')}
              className="mb-4"
            >
              <MdArrowBack className="w-4 h-4 mr-2" />
              Back to Payments
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Payment Details</h1>
            <p className="text-muted-foreground mt-2">View complete payment information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <MdPayment className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                  {isAdmin && canManagePayments && (
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
                    <p className="text-sm text-muted-foreground mb-1">Amount</p>
                    <p className="text-2xl font-bold">₦{payment.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <div className="mt-1">{getStatusBadge(payment.status)}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="font-medium">{payment.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Fee Type</p>
                    <p className="font-medium">
                      {(payment.feeType ?? '-')
                        .replaceAll('_', ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                    <p className="font-medium">
                      {(payment.paymentMethod ?? '-')
                        .replaceAll('_', ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                  </div>
                  {payment.transactionId && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                      <p className="font-mono text-sm">{payment.transactionId}</p>
                    </div>
                  )}
                </div>

                {payment.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <MdInfo className="w-4 h-4" />
                        Notes
                      </p>
                      <p className="text-sm">{payment.notes}</p>
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
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                  <p className="font-medium">
                    {payment.dueDate ? format(new Date(payment.dueDate), 'MMM dd, yyyy') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Paid Date</p>
                  <p className="font-medium">
                    {payment.paidAt ? format(new Date(payment.paidAt), 'MMM dd, yyyy') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="font-medium">
                    {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                  <p className="font-medium">
                    {format(new Date(payment.updatedAt), 'MMM dd, yyyy')}
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
                  <p className="font-mono text-xs">{payment.userId}</p>
                </div>
                {payment.applicationId && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Application ID</p>
                    <p className="font-mono text-xs">{payment.applicationId}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Currency</p>
                  <p className="font-medium">{payment.currency}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {payment && isAdmin && canManagePayments && (
        <EditPaymentStatusModal
          open={editOpen}
          onOpenChange={setEditOpen}
          payment={payment}
          isLoading={updateStatus.isPending}
          onUpdate={(status, notes) => {
            updateStatus.mutate(
              { id: payment.id, status, notes },
              {
                onSuccess: () => setEditOpen(false),
              }
            );
          }}
        />
      )}
    </>
  );
}

