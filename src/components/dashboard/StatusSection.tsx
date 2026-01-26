import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MdCheckCircle, 
  MdPending, 
  MdCancel, 
  MdAccessTime,
  MdPayment,
  MdErrorOutline,
  MdAssignment
} from 'react-icons/md';
import type { ApplicationStats } from '@/types/application';
import type { PaymentSummary } from '@/types/payment';

interface StatusSectionProps {
  applicationStats?: ApplicationStats;
  paymentSummary?: PaymentSummary;
  isLoading?: boolean;
}

export const StatusSection = ({ applicationStats, paymentSummary, isLoading }: StatusSectionProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Overview</CardTitle>
          <CardDescription>Current application and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Status Overview</CardTitle>
            <CardDescription className="mt-1">Current application and payment status</CardDescription>
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <MdCheckCircle className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-6">
        <div className="space-y-8">
          {/* Application Status */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <MdAssignment className="w-5 h-5 text-primary" />
              Application Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex flex-col items-center p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors group">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mb-2 group-hover:scale-110 transition-transform">
                  <MdAccessTime className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground mb-1">Draft</span>
                <span className="text-xl font-bold text-foreground">{applicationStats?.draft || 0}</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-950/30 transition-colors group">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 mb-2 group-hover:scale-110 transition-transform">
                  <MdPending className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground mb-1">Submitted</span>
                <span className="text-xl font-bold text-foreground">{applicationStats?.submitted || 0}</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/30 transition-colors group">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 mb-2 group-hover:scale-110 transition-transform">
                  <MdAccessTime className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground mb-1">Under Review</span>
                <span className="text-xl font-bold text-foreground">{applicationStats?.under_review || 0}</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors group">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 mb-2 group-hover:scale-110 transition-transform">
                  <MdCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground mb-1">Approved</span>
                <span className="text-xl font-bold text-foreground">{applicationStats?.approved || 0}</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors group">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 mb-2 group-hover:scale-110 transition-transform">
                  <MdCancel className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground mb-1">Rejected</span>
                <span className="text-xl font-bold text-foreground">{applicationStats?.rejected || 0}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <MdPayment className="w-5 h-5 text-primary" />
              Payment Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors group">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 mb-2 group-hover:scale-110 transition-transform">
                  <MdPayment className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground mb-1">Paid</span>
                <span className="text-lg font-bold text-foreground">₦{paymentSummary?.paid.toLocaleString() || 0}</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-950/30 transition-colors group">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 mb-2 group-hover:scale-110 transition-transform">
                  <MdPending className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground mb-1">Pending</span>
                <span className="text-lg font-bold text-foreground">₦{paymentSummary?.pending.toLocaleString() || 0}</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors group">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 mb-2 group-hover:scale-110 transition-transform">
                  <MdErrorOutline className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground mb-1">Failed</span>
                <span className="text-lg font-bold text-foreground">₦{paymentSummary?.failed.toLocaleString() || 0}</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 hover:bg-gray-100 dark:hover:bg-gray-950/30 transition-colors group">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900/30 mb-2 group-hover:scale-110 transition-transform">
                  <MdPayment className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground mb-1">Refunded</span>
                <span className="text-lg font-bold text-foreground">₦{paymentSummary?.refunded.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

