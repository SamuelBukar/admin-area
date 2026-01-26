import { useState, useEffect } from 'react';
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
import type { Payment } from '@/types/payment';

interface EditPaymentStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment;
  onUpdate: (status: Payment['status'], notes?: string) => void;
  isLoading?: boolean;
}

export const EditPaymentStatusModal = ({
  open,
  onOpenChange,
  payment,
  onUpdate,
  isLoading = false,
}: EditPaymentStatusModalProps) => {
  const [status, setStatus] = useState<Payment['status']>(payment.status);
  const [notes, setNotes] = useState(payment.notes || '');

  useEffect(() => {
    if (open) {
      setStatus(payment.status);
      setNotes(payment.notes || '');
    }
  }, [open, payment]);

  const handleSubmit = () => {
    onUpdate(status, notes);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Payment Status</DialogTitle>
          <DialogDescription>
            Update the payment status and add notes if needed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Payment Details</Label>
            <div className="p-3 rounded-lg border border-border bg-muted/50">
              <p className="text-sm font-medium">{payment.description}</p>
              <p className="text-sm text-muted-foreground">Amount: ₦{payment.amount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Current Status: {getStatusBadge(payment.status)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: Payment['status']) => setStatus(value)} disabled={isLoading}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this payment status change..."
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || status === payment.status}>
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

