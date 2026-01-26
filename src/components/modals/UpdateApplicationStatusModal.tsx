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
import type { Application, ApplicationStatus } from '@/types/application';

interface UpdateApplicationStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  onUpdate: (id: string, status: ApplicationStatus, rejectionReason?: string) => void;
  isUpdating?: boolean;
}

export const UpdateApplicationStatusModal = ({
  open,
  onOpenChange,
  application,
  onUpdate,
  isUpdating = false,
}: UpdateApplicationStatusModalProps) => {
  const [status, setStatus] = useState<ApplicationStatus>('submitted');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (application) {
      setStatus(application.status);
      setRejectionReason(application.rejectionReason || '');
    }
  }, [application, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    if (status === 'rejected' && !rejectionReason.trim()) {
      return; // Validation handled by required attribute
    }

    onUpdate(application.id, status, status === 'rejected' ? rejectionReason : undefined);
  };

  const getAvailableStatuses = (currentStatus: ApplicationStatus): ApplicationStatus[] => {
    // Define status flow
    const statusFlow: Record<ApplicationStatus, ApplicationStatus[]> = {
      draft: ['submitted', 'rejected'],
      submitted: ['under_review', 'approved', 'rejected'],
      under_review: ['approved', 'rejected'],
      approved: [], // Approved is final
      rejected: ['submitted', 'under_review'], // Can resubmit or review again
    };

    return statusFlow[currentStatus] || [];
  };

  if (!application) return null;

  const availableStatuses = getAvailableStatuses(application.status);
  const canChangeStatus = availableStatuses.length > 0 || status !== application.status;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>
              Update the status for application: <strong>{application.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div className="text-sm font-medium text-muted-foreground">
                {application.status === 'draft' ? 'Draft' :
                 application.status === 'submitted' ? 'Submitted' :
                 application.status === 'under_review' ? 'Under Review' :
                 application.status === 'approved' ? 'Approved' :
                 'Rejected'}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">New Status *</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as ApplicationStatus)}
                disabled={!canChangeStatus || isUpdating}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.length > 0 ? (
                    availableStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s === 'submitted' ? 'Submitted' :
                         s === 'under_review' ? 'Under Review' :
                         s === 'approved' ? 'Approved' :
                         'Rejected'}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={application.status}>
                      {application.status === 'draft' ? 'Draft' :
                       application.status === 'submitted' ? 'Submitted' :
                       application.status === 'under_review' ? 'Under Review' :
                       application.status === 'approved' ? 'Approved' :
                       'Rejected'} (Current)
                    </SelectItem>
                  )}
                  {/* Allow keeping current status if no transitions available */}
                  {availableStatuses.length === 0 && (
                    <SelectItem value={application.status}>
                      Keep Current Status
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {availableStatuses.length === 0 && application.status === 'approved' && (
                <p className="text-xs text-muted-foreground">
                  This application is already approved and cannot be changed.
                </p>
              )}
            </div>

            {status === 'rejected' && (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={4}
                  required
                  disabled={isUpdating}
                />
                <p className="text-xs text-muted-foreground">
                  A rejection reason is required when rejecting an application.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canChangeStatus || status === application.status || isUpdating || (status === 'rejected' && !rejectionReason.trim())}
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

