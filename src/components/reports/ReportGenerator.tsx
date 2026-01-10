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
import { toast } from 'sonner';
import { useGenerateApprovalSheet } from '@/hooks/useQueries';

interface ReportGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
}

type ReportType = 'status' | 'allocations' | 'bill' | 'invoice' | 'certificate';

export const ReportGenerator = ({ open, onOpenChange, applicationId }: ReportGeneratorProps) => {
  const [reportType, setReportType] = useState<ReportType>('status');
  const generateReport = useGenerateApprovalSheet();

  const handleGenerate = async () => {
    if (!applicationId) {
      toast.error('Application ID is required');
      return;
    }

    try {
      // For now, we'll use the existing approval sheet generation
      // In a full implementation, each report type would call a different API
      await generateReport.mutateAsync({
        applicationId,
        allocationId: undefined,
      });
      // In a full implementation, this would trigger PDF download
      toast.success('Report generated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Generate report error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>
            Select the type of report you want to generate for this application.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Status Report</SelectItem>
                <SelectItem value="allocations">Allocations Report</SelectItem>
                <SelectItem value="bill">Bill</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {reportType === 'status' && 'Generate a detailed status report showing application progress and timeline.'}
            {reportType === 'allocations' && 'Generate a report showing allocation details related to this application.'}
            {reportType === 'bill' && 'Generate a bill for payments associated with this application.'}
            {reportType === 'invoice' && 'Generate an invoice for payments associated with this application.'}
            {reportType === 'certificate' && 'Generate an approval certificate (only for approved applications).'}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={generateReport.isPending}>
            {generateReport.isPending ? 'Generating...' : 'Generate Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

