import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MdDownload, MdPrint } from 'react-icons/md';
import type { Application } from '@/types/application';
import type { Allocation } from '@/types/allocation';
import type { Payment } from '@/types/payment';
import { format } from 'date-fns';

interface ApprovalSheetProps {
  application: Application;
  allocation?: Allocation;
  payment?: Payment;
  onDownload?: () => void;
}

export const ApprovalSheet = ({ application, allocation, payment, onDownload }: ApprovalSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!sheetRef.current) return;

    try {
      const canvas = await html2canvas(sheetRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`approval-sheet-${application.id}.pdf`);
      
      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={handlePrint}>
          <MdPrint className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button onClick={handleDownloadPDF}>
          <MdDownload className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <Card ref={sheetRef} className="p-8 bg-white print:bg-white">
        <CardContent className="space-y-6">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-3xl font-bold mb-2">APPROVAL SHEET</h1>
            <p className="text-muted-foreground">Land Administration System</p>
          </div>

          {/* Application Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Application Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Application ID</p>
                <p className="font-medium">{application.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Application Type</p>
                <p className="font-medium">
                  {application.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{application.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{application.status.replace('_', ' ').toUpperCase()}</p>
              </div>
              {application.submittedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Submitted Date</p>
                  <p className="font-medium">{format(new Date(application.submittedAt), 'MMM dd, yyyy')}</p>
                </div>
              )}
              {application.approvedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Approved Date</p>
                  <p className="font-medium">{format(new Date(application.approvedAt), 'MMM dd, yyyy')}</p>
                </div>
              )}
            </div>
            {application.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{application.description}</p>
              </div>
            )}
          </div>

          {/* Allocation Information */}
          {allocation && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Allocation Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Allocation ID</p>
                  <p className="font-medium">{allocation.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{allocation.type.charAt(0).toUpperCase() + allocation.type.slice(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{allocation.location}</p>
                </div>
                {allocation.parcelNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Parcel Number</p>
                    <p className="font-medium">{allocation.parcelNumber}</p>
                  </div>
                )}
                {allocation.size && (
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-medium">{allocation.size}</p>
                  </div>
                )}
                {allocation.allocatedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Allocated Date</p>
                    <p className="font-medium">{format(new Date(allocation.allocatedAt), 'MMM dd, yyyy')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          {payment && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Payment Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment ID</p>
                  <p className="font-medium">{payment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{payment.status.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">₦{payment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fee Type</p>
                  <p className="font-medium">
                    {payment.feeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
                {payment.paidAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Paid Date</p>
                    <p className="font-medium">{format(new Date(payment.paidAt), 'MMM dd, yyyy')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Signature Section */}
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold border-b pb-2">Approval Signatures</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-sm font-medium">Applicant Signature</p>
                <div className="h-16 border-b border-foreground"></div>
                <p className="text-xs text-muted-foreground">Date: _______________</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Approving Officer Signature</p>
                <div className="h-16 border-b border-foreground"></div>
                <p className="text-xs text-muted-foreground">Date: _______________</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground border-t pt-4 mt-8">
            <p>This is an official approval document generated by the Land Administration System</p>
            <p>Generated on: {format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

