// Report types for API responses
export type ReportType = 'approval_sheet' | 'status_report' | 'allocations_report' | 'bill' | 'invoice' | 'certificate';

export interface ApprovalSheetReport {
  id: string;
  applicationId: string;
  allocationId?: string;
  generatedAt: string;
  status: string;
  content: string;
  url?: string;
}

export interface StatusReport {
  id: string;
  applicationId: string;
  generatedAt: string;
  status: string;
  summary: string;
  content: string;
  url?: string;
}

export interface AllocationsReport {
  id: string;
  applicationId: string;
  generatedAt: string;
  allocations: Array<{
    id: string;
    amount: number;
    status: string;
  }>;
  totalAllocated: number;
  url?: string;
}

export interface BillInvoiceReport {
  id: string;
  applicationId: string;
  type: 'bill' | 'invoice';
  generatedAt: string;
  amount: number;
  dueDate?: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
  url?: string;
}

export interface CertificateReport {
  id: string;
  applicationId: string;
  generatedAt: string;
  recipientName: string;
  certificateNumber: string;
  issueDate: string;
  url?: string;
}

export interface ReportGenerateRequest {
  applicationId: string;
  allocationId?: string;
  type?: string;
}
