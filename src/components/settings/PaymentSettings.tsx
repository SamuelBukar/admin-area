import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const PaymentSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Gateway Configuration</CardTitle>
        <CardDescription>
          Configure online payment processing for your system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            Payment gateway configuration is managed by the backend. This admin UI does not store or simulate gateway settings.
            To enable online payments, configure your server integration and expose the required endpoints.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

