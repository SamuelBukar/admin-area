import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MdSearch, MdArrowUpward, MdArrowDownward, MdVisibility } from 'react-icons/md';
import { useAuth } from '@/contexts/AuthContext';
import { usePayments, useUserPayments, useApplications } from '@/hooks/useQueries';
import type { Payment } from '@/types/payment';
import { format } from 'date-fns';

type SortField = 'description' | 'amount' | 'status' | 'dueDate' | 'paidAt';
type SortDirection = 'asc' | 'desc';

export default function Payments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const userId = user?.id || '';

  const { data: allPayments, isLoading: allPaymentsLoading } = usePayments();
  const { data: userPayments, isLoading: userPaymentsLoading } = useUserPayments(userId);
  const { data: allApplications } = useApplications();

  const safeAllPayments = Array.isArray(allPayments) ? allPayments : [];
  const safeUserPayments = Array.isArray(userPayments) ? userPayments : [];
  const safeApplications = Array.isArray(allApplications) ? allApplications : [];

  const payments = isAdmin ? safeAllPayments : safeUserPayments;
  const isLoading = isAdmin ? allPaymentsLoading : userPaymentsLoading;

  // Helper to get applicant info from payment
  const getApplicantInfo = (payment: Payment) => {
    if (!payment.applicationId || !allApplications) return null;
    const application = allApplications.find(app => app.id === payment.applicationId);
    return application ? {
      name: application.applicantName || 'Unknown',
      email: application.applicantEmail || '',
      phone: application.applicantPhone || '',
      isCompany: application.applicant?.type === 'company',
      id: application.applicant?.id || '',
    } : null;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [feeTypeFilter, setFeeTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments.filter((payment) => {
      const matchesSearch = 
        (payment.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (payment.transactionId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (isAdmin && (payment.userId || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
        (isAdmin && (() => {
          const applicantInfo = getApplicantInfo(payment);
          return applicantInfo ? 
            (applicantInfo.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (applicantInfo.email || '').toLowerCase().includes(searchQuery.toLowerCase())
            : false;
        })());
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesFeeType = feeTypeFilter === 'all' || payment.feeType === feeTypeFilter;

      return matchesSearch && matchesStatus && matchesFeeType;
    });

    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case 'description':
            aValue = (a.description || '').toLowerCase();
            bValue = (b.description || '').toLowerCase();
            break;
          case 'amount':
            aValue = a.amount;
            bValue = b.amount;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'dueDate':
            aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            break;
          case 'paidAt':
            aValue = a.paidAt ? new Date(a.paidAt).getTime() : 0;
            bValue = b.paidAt ? new Date(b.paidAt).getTime() : 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [payments, searchQuery, statusFilter, feeTypeFilter, sortField, sortDirection, isAdmin]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <MdArrowUpward className="w-4 h-4 ml-1" />
    ) : (
      <MdArrowDownward className="w-4 h-4 ml-1" />
    );
  };

  const getStatusBadge = (status: Payment['status']) => {
    const variants = {
      paid: 'default',
      pending: 'secondary',
      failed: 'destructive',
      refunded: 'outline',
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleView = (paymentId: string) => {
    navigate(`/dashboard/payments/${paymentId}`);
  };

  return (
    <>
      <Helmet>
        <title>Payments | LandAdmin Builder</title>
        <meta name="description" content="View and manage payments" />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Payments</h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'View and manage all payments across the system.'
              : 'Track all your payments and fees.'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Search, filter, and sort your payments</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={feeTypeFilter} onValueChange={setFeeTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Fee Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="application_fee">Application Fee</SelectItem>
                  <SelectItem value="processing_fee">Processing Fee</SelectItem>
                  <SelectItem value="allocation_fee">Allocation Fee</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : filteredAndSortedPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No payments found</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {isAdmin && (
                        <TableHead>
                          <button
                            onClick={() => handleSort('description')}
                            className="flex items-center hover:text-foreground"
                          >
                            Applicant
                            {getSortIcon('description')}
                          </button>
                        </TableHead>
                      )}
                      <TableHead>
                        <button
                          onClick={() => handleSort('description')}
                          className="flex items-center hover:text-foreground"
                        >
                          Description
                          {getSortIcon('description')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('amount')}
                          className="flex items-center hover:text-foreground"
                        >
                          Amount
                          {getSortIcon('amount')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center hover:text-foreground"
                        >
                          Status
                          {getSortIcon('status')}
                        </button>
                      </TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('dueDate')}
                          className="flex items-center hover:text-foreground"
                        >
                          Due Date
                          {getSortIcon('dueDate')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('paidAt')}
                          className="flex items-center hover:text-foreground"
                        >
                          Paid Date
                          {getSortIcon('paidAt')}
                        </button>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedPayments.map((payment) => {
                      const applicantInfo = getApplicantInfo(payment);
                      return (
                      <TableRow key={payment.id}>
                        {isAdmin && (
                          <TableCell>
                            {applicantInfo ? (
                              <div className="space-y-1">
                                <div className="font-medium">{applicantInfo.name}</div>
                                {applicantInfo.id && (
                                  <div className="text-xs text-muted-foreground font-mono">ID: {applicantInfo.id}</div>
                                )}
                                <div className="text-xs text-muted-foreground">{applicantInfo.email || payment.userId}</div>
                                {applicantInfo.phone && (
                                  <div className="text-xs text-muted-foreground">{applicantInfo.phone}</div>
                                )}
                                {applicantInfo.isCompany && (
                                  <div className="text-xs text-blue-600 dark:text-blue-400">Company</div>
                                )}
                              </div>
                            ) : (
                              <div className="font-mono text-xs">{payment.userId || '-'}</div>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="font-medium">{payment.description || '-'}</TableCell>
                        <TableCell>₦{(payment.amount || 0).toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {(payment.feeType || '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </TableCell>
                        <TableCell>
                          {payment.dueDate ? format(new Date(payment.dueDate), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          {payment.paidAt ? format(new Date(payment.paidAt), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(payment.id)}
                          >
                            <MdVisibility className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

