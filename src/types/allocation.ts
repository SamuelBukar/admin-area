export type AllocationType = 'land' | 'resource';
export type AllocationStatus = 'pending' | 'allocated' | 'completed' | 'cancelled';

export interface Allocation {
  id: string;
  applicationId: string;
  userId: string;
  type: AllocationType;
  status: AllocationStatus;
  location: string;
  parcelNumber?: string;
  size?: string;
  allocatedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  details?: Record<string, any>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AllocationStats {
  total: number;
  pending: number;
  allocated: number;
  completed: number;
  cancelled: number;
}

