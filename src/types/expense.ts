import type { FeeType, PaymentStatus } from './payment';

export type ExpenseType = FeeType; // application_fee | processing_fee | allocation_fee | other

export interface Expense {
  id: string;
  userId: string;
  type: ExpenseType;
  amount: number;
  date: string;
  status: PaymentStatus;
  paymentId?: string;
  description: string;
  createdAt: string;
}

export interface ExpenseChartData {
  date: string;
  amount: number;
  type: ExpenseType;
}

export interface ExpenseSummary {
  total: number;
  byType: Record<ExpenseType, number>;
  byStatus: Record<PaymentStatus, number>;
  period: {
    start: string;
    end: string;
  };
}

