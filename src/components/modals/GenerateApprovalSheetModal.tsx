import { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApprovalSheet } from '@/components/reports/ApprovalSheet';
import type { Application } from '@/types/application';
import type { Allocation } from '@/types/allocation';
import type { Payment } from '@/types/payment';

interface GenerateApprovalSheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applications: Application[];
  allocations: Allocation[];
  payments: Payment[];
}

export const GenerateApprovalSheetModal = ({
  open,
  onOpenChange,
  applications,
  allocations,
  payments,
}: GenerateApprovalSheetModalProps) => {
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>('');
  const [selectedAllocationId, setSelectedAllocationId] = useState<string>('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');

  const safeApplications = Array.isArray(applications) ? applications : [];
  const safeAllocations = Array.isArray(allocations) ? allocations : [];
  const safePayments = Array.isArray(payments) ? payments : [];

  const selectedApplication = safeApplications.find((a) => a.id === selectedApplicationId);
  const selectedAllocation = safeAllocations.find((a) => a.id === selectedAllocationId);
  const selectedPayment = safePayments.find((p) => p.id === selectedPaymentId);

  const availableAllocations = selectedApplicationId
    ? safeAllocations.filter((a) => a.applicationId === selectedApplicationId)
    : [];

  const availablePayments = selectedApplicationId
    ? safePayments.filter((p) => p.applicationId === selectedApplicationId)
    : [];

  const handleGenerate = () => {
    // The ApprovalSheet component will handle the download
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Approval Sheet</DialogTitle>
          <DialogDescription>
            Select an application and related allocation/payment to generate an approval sheet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="application">Application</Label>
            <Select
              value={selectedApplicationId}
              onValueChange={(value) => {
                setSelectedApplicationId(value);
                setSelectedAllocationId('');
                setSelectedPaymentId('');
              }}
            >
              <SelectTrigger id="application">
                <SelectValue placeholder="Select an application" />
              </SelectTrigger>
              <SelectContent>
                {applications.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.title} - {app.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedApplicationId && (
            <>
              <div className="space-y-2">
                <Label htmlFor="allocation">Allocation (Optional)</Label>
                <Select
                  value={selectedAllocationId}
                  onValueChange={setSelectedAllocationId}
                >
                  <SelectTrigger id="allocation">
                    <SelectValue placeholder="Select an allocation (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {availableAllocations.map((alloc) => (
                      <SelectItem key={alloc.id} value={alloc.id}>
                        {alloc.location} - {alloc.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment">Payment (Optional)</Label>
                <Select
                  value={selectedPaymentId}
                  onValueChange={setSelectedPaymentId}
                >
                  <SelectTrigger id="payment">
                    <SelectValue placeholder="Select a payment (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {availablePayments.map((payment) => (
                      <SelectItem key={payment.id} value={payment.id}>
                        {payment.description} - ₦{payment.amount}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {selectedApplication && (
            <div className="mt-4 border-t pt-4">
              <ApprovalSheet
                application={selectedApplication}
                allocation={selectedAllocation}
                payment={selectedPayment}
                onDownload={() => onOpenChange(false)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

