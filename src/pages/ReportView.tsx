import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { MdArrowBack, MdDescription, MdInfo, MdDownload } from 'react-icons/md';
import { useApplication } from '@/hooks/useQueries';
import { useAllocations, usePayments } from '@/hooks/useQueries';
import { ApprovalSheet } from '@/components/reports/ApprovalSheet';
import { format } from 'date-fns';
import { FaCalendar } from 'react-icons/fa';

export default function ReportView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: application, isLoading } = useApplication(id || '');
  const { data: allAllocations } = useAllocations();
  const { data: allPayments } = usePayments();
  const [selectedAllocationId, setSelectedAllocationId] = useState<string>('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');

  const relatedAllocations = application
    ? (allAllocations || []).filter((a) => a.applicationId === application.id)
    : [];
  const relatedPayments = application
    ? (allPayments || []).filter((p) => p.applicationId === application.id)
    : [];

  const selectedAllocation = relatedAllocations.find((a) => a.id === selectedAllocationId);
  const selectedPayment = relatedPayments.find((p) => p.id === selectedPaymentId);

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { variant: 'outline' as const, label: 'Draft' },
      submitted: { variant: 'secondary' as const, label: 'Submitted' },
      under_review: { variant: 'default' as const, label: 'Under Review' },
      approved: { variant: 'default' as const, label: 'Approved' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
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

  if (!application) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Application not found</p>
            <Button onClick={() => navigate('/dashboard/reports')} className="mt-4">
              <MdArrowBack className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Report Details | LandAdmin Builder</title>
        <meta name="description" content="View and generate report" />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/reports')}
              className="mb-4"
            >
              <MdArrowBack className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Report Details</h1>
            <p className="text-muted-foreground mt-2">View and generate approval sheet</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MdDescription className="w-5 h-5" />
                  Application Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Title</p>
                    <p className="text-lg font-semibold">{application.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <div className="mt-1">{getStatusBadge(application.status)}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Type</p>
                    <p className="font-medium">
                      {application.type === 'land_allocation' ? 'Land Allocation' : 'Resource Allocation'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Priority</p>
                    <p className="font-medium capitalize">{application.priority}</p>
                  </div>
                  {application.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{application.description}</p>
                    </div>
                  )}
                  {application.rejectionReason && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Rejection Reason</p>
                      <p className="text-sm text-destructive">{application.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Approval Sheet */}
            {application && (
              <Card>
                <CardHeader>
                  <CardTitle>Approval Sheet</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Generate and download the approval sheet for this application
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedAllocations.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select Allocation (Optional)</label>
                      <select
                        value={selectedAllocationId}
                        onChange={(e) => setSelectedAllocationId(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">None</option>
                        {relatedAllocations.map((alloc) => (
                          <option key={alloc.id} value={alloc.id}>
                            {alloc.location} - {alloc.status}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {relatedPayments.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select Payment (Optional)</label>
                      <select
                        value={selectedPaymentId}
                        onChange={(e) => setSelectedPaymentId(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">None</option>
                        {relatedPayments.map((payment) => (
                          <option key={payment.id} value={payment.id}>
                            {payment.description} - ${payment.amount}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <ApprovalSheet
                      application={application}
                      allocation={selectedAllocation}
                      payment={selectedPayment}
                      onDownload={() => {}}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
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
                {application.submittedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Submitted</p>
                    <p className="font-medium">
                      {format(new Date(application.submittedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                {application.reviewedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reviewed</p>
                    <p className="font-medium">
                      {format(new Date(application.reviewedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                {application.approvedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Approved</p>
                    <p className="font-medium">
                      {format(new Date(application.approvedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                {application.rejectedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Rejected</p>
                    <p className="font-medium">
                      {format(new Date(application.rejectedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="font-medium">
                    {format(new Date(application.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                  <p className="font-medium">
                    {format(new Date(application.updatedAt), 'MMM dd, yyyy')}
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
                  <p className="font-mono text-xs">{application.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Application ID</p>
                  <p className="font-mono text-xs">{application.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

