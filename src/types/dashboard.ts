import type { ApplicationStats } from './application';
import type { AllocationStats } from './allocation';
import type { PaymentSummary } from './payment';
import type { ExpenseSummary } from './expense';

export interface UserDashboardStats {
  applications: ApplicationStats;
  allocations: AllocationStats;
  payments: PaymentSummary;
  expenses: ExpenseSummary;
  progress: {
    applicationsCompleted: number;
    applicationsTotal: number;
    completionRate: number;
  };
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ProgressMetrics {
  applications: {
    submitted: number;
    approved: number;
    rejected: number;
    pending: number;
  };
  payments: {
    paid: number;
    pending: number;
    overdue: number;
  };
  allocations: {
    allocated: number;
    pending: number;
    completed: number;
  };
}

