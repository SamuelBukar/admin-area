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
import { MdSearch, MdArrowUpward, MdArrowDownward, MdVisibility, MdLocationOn } from 'react-icons/md';
import { useAuth } from '@/contexts/AuthContext';
import { useAllocations, useUserAllocations } from '@/hooks/useQueries';
import type { Allocation } from '@/types/allocation';
import { format } from 'date-fns';

type SortField = 'location' | 'type' | 'status' | 'allocatedAt' | 'completedAt';
type SortDirection = 'asc' | 'desc';

export default function Allocations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const userId = user?.id || '';

  const { data: allAllocations, isLoading: allAllocationsLoading } = useAllocations();
  const { data: userAllocations, isLoading: userAllocationsLoading } = useUserAllocations(userId);

  const allocations = isAdmin ? (allAllocations || []) : (userAllocations || []);
  const isLoading = isAdmin ? allAllocationsLoading : userAllocationsLoading;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredAndSortedAllocations = useMemo(() => {
    let filtered = allocations.filter((allocation) => {
      const matchesSearch = 
        allocation.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        allocation.parcelNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (isAdmin && allocation.userId.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || allocation.status === statusFilter;
      const matchesType = typeFilter === 'all' || allocation.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case 'location':
            aValue = a.location.toLowerCase();
            bValue = b.location.toLowerCase();
            break;
          case 'type':
            aValue = a.type;
            bValue = b.type;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'allocatedAt':
            aValue = a.allocatedAt ? new Date(a.allocatedAt).getTime() : 0;
            bValue = b.allocatedAt ? new Date(b.allocatedAt).getTime() : 0;
            break;
          case 'completedAt':
            aValue = a.completedAt ? new Date(a.completedAt).getTime() : 0;
            bValue = b.completedAt ? new Date(b.completedAt).getTime() : 0;
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
  }, [allocations, searchQuery, statusFilter, typeFilter, sortField, sortDirection, isAdmin]);

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

  const getStatusBadge = (status: Allocation['status']) => {
    const config = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      allocated: { variant: 'default' as const, label: 'Allocated' },
      completed: { variant: 'default' as const, label: 'Completed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' },
    };

    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleView = (allocationId: string) => {
    navigate(`/dashboard/allocations/${allocationId}`);
  };

  return (
    <>
      <Helmet>
        <title>Allocations | LandAdmin Builder</title>
        <meta name="description" content="View and manage allocations" />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Allocations</h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'View and manage all allocations across the system.'
              : 'View your allocated land and resources.'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Allocation History</CardTitle>
            <CardDescription>Search, filter, and sort your allocations</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search allocations..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="allocated">Allocated</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : filteredAndSortedAllocations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No allocations found</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {isAdmin && (
                        <TableHead>
                          <button
                            onClick={() => handleSort('location')}
                            className="flex items-center hover:text-foreground"
                          >
                            User ID
                            {getSortIcon('location')}
                          </button>
                        </TableHead>
                      )}
                      <TableHead>
                        <button
                          onClick={() => handleSort('location')}
                          className="flex items-center hover:text-foreground"
                        >
                          Location
                          {getSortIcon('location')}
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
                      <TableHead>Parcel Number</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('allocatedAt')}
                          className="flex items-center hover:text-foreground"
                        >
                          Allocated Date
                          {getSortIcon('allocatedAt')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('completedAt')}
                          className="flex items-center hover:text-foreground"
                        >
                          Completed Date
                          {getSortIcon('completedAt')}
                        </button>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedAllocations.map((allocation) => (
                      <TableRow key={allocation.id}>
                        {isAdmin && (
                          <TableCell className="font-mono text-xs">{allocation.userId}</TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MdLocationOn className="w-4 h-4 text-primary" />
                            <span className="font-medium">{allocation.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {allocation.type === 'land' ? 'Land' : 'Resource'}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(allocation.status)}</TableCell>
                        <TableCell>
                          {allocation.parcelNumber || '-'}
                        </TableCell>
                        <TableCell>
                          {allocation.size || '-'}
                        </TableCell>
                        <TableCell>
                          {allocation.allocatedAt ? format(new Date(allocation.allocatedAt), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          {allocation.completedAt ? format(new Date(allocation.completedAt), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(allocation.id)}
                          >
                            <MdVisibility className="w-4 h-4 mr-2" />
                            View
                          </Button>
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

