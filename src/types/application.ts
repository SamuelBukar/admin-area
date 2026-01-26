export type ApplicationType = 'land_allocation' | 'resource_allocation';
export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
export type ApplicationPriority = 'low' | 'medium' | 'high' | 'urgent';

import type { Applicant } from './applicant';

export interface Application {
  id: string;
  userId: string;
  pageId?: string; // Reference to published page
  type: ApplicationType;
  status: ApplicationStatus;
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  priority: ApplicationPriority;
  title: string;
  description?: string;
  formData?: Record<string, any>; // Form field values
  // Applicant information
  applicant?: Applicant;
  applicantName?: string; // Display name (person: "John Doe", company: "Acme Corp")
  applicantEmail?: string;
  applicantPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStatusHistory {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  changedBy: string;
  changedAt: string;
  notes?: string;
}

export interface ApplicationStats {
  total: number;
  draft: number;
  submitted: number;
  under_review: number;
  approved: number;
  rejected: number;
}

