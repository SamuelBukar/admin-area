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
import { MdSearch, MdArrowUpward, MdArrowDownward, MdVisibility, MdDescription, MdDownload } from 'react-icons/md';
import { useAuth } from '@/contexts/AuthContext';
import { useApplications, useUserApplications } from '@/hooks/useQueries';
import type { Application } from '@/types/application';
import { format } from 'date-fns';

type SortField = 'title' | 'type' | 'status' | 'submittedAt' | 'approvedAt' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const userId = user?.id || '';

  const { data: allApplications, isLoading: allApplicationsLoading } = useApplications();
  const { data: userApplications, isLoading: userApplicationsLoading } = useUserApplications(userId);

  const applications = isAdmin ? (allApplications || []) : (userApplications || []);
  const isLoading = isAdmin ? allApplicationsLoading : userApplicationsLoading;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = applications.filter((application) => {
      const matchesSearch = 
        application.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        application.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (isAdmin && application.userId.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
      const matchesType = typeFilter === 'all' || application.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'type':
            aValue = a.type;
            bValue = b.type;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'submittedAt':
            aValue = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
            bValue = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
            break;
          case 'approvedAt':
            aValue = a.approvedAt ? new Date(a.approvedAt).getTime() : 0;
            bValue = b.approvedAt ? new Date(b.approvedAt).getTime() : 0;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
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
  }, [applications, searchQuery, statusFilter, typeFilter, sortField, sortDirection, isAdmin]);

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

  const getStatusBadge = (status: Application['status']) => {
    const config = {
      draft: { variant: 'outline' as const, label: 'Draft' },
      submitted: { variant: 'secondary' as const, label: 'Submitted' },
      under_review: { variant: 'default' as const, label: 'Under Review' },
      approved: { variant: 'default' as const, label: 'Approved' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
    };

    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleView = (applicationId: string) => {
    navigate(`/dashboard/reports/${applicationId}`);
  };

  return (
    <>
      <Helmet>
        <title>Reports | LandAdmin Builder</title>
        <meta name="description" content="View and generate reports" />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Reports</h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'View and generate reports for all applications.'
              : 'View and generate reports for your applications.'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Reports</CardTitle>
            <CardDescription>Search, filter, and generate reports for applications</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="land_allocation">Land Allocation</SelectItem>
                  <SelectItem value="resource_allocation">Resource Allocation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : filteredAndSortedApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No applications found</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {isAdmin && (
                        <TableHead>
                          <button
                            onClick={() => handleSort('title')}
                            className="flex items-center hover:text-foreground"
                          >
                            User ID
                            {getSortIcon('title')}
                          </button>
                        </TableHead>
                      )}
                      <TableHead>
                        <button
                          onClick={() => handleSort('title')}
                          className="flex items-center hover:text-foreground"
                        >
                          Title
                          {getSortIcon('title')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('type')}
                          className="flex items-center hover:text-foreground"
                        >
                          Type
                          {getSortIcon('type')}
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
                      <TableHead>
                        <button
                          onClick={() => handleSort('submittedAt')}
                          className="flex items-center hover:text-foreground"
                        >
                          Submitted Date
                          {getSortIcon('submittedAt')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('approvedAt')}
                          className="flex items-center hover:text-foreground"
                        >
                          Approved Date
                          {getSortIcon('approvedAt')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('createdAt')}
                          className="flex items-center hover:text-foreground"
                        >
                          Created Date
                          {getSortIcon('createdAt')}
                        </button>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedApplications.map((application) => (
                      <TableRow key={application.id}>
                        {isAdmin && (
                          <TableCell className="font-mono text-xs">{application.userId}</TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MdDescription className="w-4 h-4 text-primary" />
                            <span className="font-medium">{application.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {application.type === 'land_allocation' ? 'Land Allocation' : 'Resource Allocation'}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(application.status)}</TableCell>
                        <TableCell>
                          {application.submittedAt ? format(new Date(application.submittedAt), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          {application.approvedAt ? format(new Date(application.approvedAt), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(application.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(application.id)}
                            >
                              <MdVisibility className="w-4 h-4 mr-2" />
                              View Report
                            </Button>
                            {!isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Navigate to report generator or open modal
                                  navigate(`/dashboard/reports/${application.id}`);
                                }}
                              >
                                <MdDownload className="w-4 h-4 mr-2" />
                                Generate
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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

