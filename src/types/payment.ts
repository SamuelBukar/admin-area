export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'online' | 'bank_transfer' | 'cash' | 'check';
export type FeeType = 'application_fee' | 'processing_fee' | 'allocation_fee' | 'other';

export interface Payment {
  id: string;
  userId: string;
  applicationId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paidAt?: string;
  dueDate: string;
  description: string;
  feeType: FeeType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  refunded: number;
}

