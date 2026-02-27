import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Allocation } from '@/types/allocation';

interface EditAllocationStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocation: Allocation;
  onUpdate: (status: Allocation['status'], notes?: string) => void;
  isLoading?: boolean;
}

export const EditAllocationStatusModal = ({
  open,
  onOpenChange,
  allocation,
  onUpdate,
  isLoading = false,
}: EditAllocationStatusModalProps) => {
  const [status, setStatus] = useState<Allocation['status']>(allocation.status);
  const [notes, setNotes] = useState(allocation.notes || '');

  useEffect(() => {
    if (open) {
      setStatus(allocation.status);
      setNotes(allocation.notes || '');
    }
  }, [open, allocation]);

  const handleSubmit = () => {
    onUpdate(status, notes);
  };

  const getStatusBadge = (status: Allocation['status']) => {
    const variants: Record<Allocation['status'], 'secondary' | 'default' | 'destructive'> = {
      pending: 'secondary',
      allocated: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Allocation Status</DialogTitle>
          <DialogDescription>Update allocation status and optionally add notes.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Allocation Details</Label>
            <div className="p-3 rounded-lg border border-border bg-muted/50">
              <p className="text-sm font-medium">{allocation.location}</p>
              <p className="text-sm text-muted-foreground">Type: {allocation.type}</p>
              <p className="text-sm text-muted-foreground">
                Current Status: {getStatusBadge(allocation.status)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allocation-status">Status</Label>
            <Select
              value={status}
              onValueChange={(value: Allocation['status']) => setStatus(value)}
              disabled={isLoading}
            >
              <SelectTrigger id="allocation-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="allocated">Allocated</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allocation-notes">Notes (Optional)</Label>
            <Textarea
              id="allocation-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this allocation status change..."
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || status === allocation.status}>
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

