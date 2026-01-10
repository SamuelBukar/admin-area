import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import type { PaymentGateway } from '@/lib/paymentService';

interface PaymentSettingsState {
  enabled: boolean;
  gateway: PaymentGateway;
  stripeApiKey: string;
  stripeSecretKey: string;
  paypalClientId: string;
  paypalSecret: string;
  testMode: boolean;
}

export const PaymentSettings = () => {
  const [settings, setSettings] = useState<PaymentSettingsState>({
    enabled: false,
    gateway: 'mock',
    stripeApiKey: '',
    stripeSecretKey: '',
    paypalClientId: '',
    paypalSecret: '',
    testMode: true,
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const saved = localStorage.getItem('payment-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load payment settings:', error);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('payment-settings', JSON.stringify(settings));
    toast.success('Payment settings saved successfully');
  };

  const handleTestPayment = async () => {
    toast.info('Processing test payment...');
    // In production, this would call the payment service
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success('Test payment processed successfully');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Gateway Configuration</CardTitle>
        <CardDescription>
          Configure online payment processing for your system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Online Payments */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enable-payments">Enable Online Payments</Label>
            <p className="text-sm text-muted-foreground">
              Allow users to make payments online through the selected gateway
            </p>
          </div>
          <Switch
            id="enable-payments"
            checked={settings.enabled}
            onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
          />
        </div>

        <Separator />

        {settings.enabled && (
          <>
            {/* Payment Gateway Selection */}
            <div className="space-y-2">
              <Label htmlFor="gateway">Payment Gateway</Label>
              <Select
                value={settings.gateway}
                onValueChange={(value: PaymentGateway) => setSettings({ ...settings, gateway: value })}
              >
                <SelectTrigger id="gateway">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mock">Mock (Development)</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the payment gateway to use for processing payments
              </p>
            </div>

            {/* Test Mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="test-mode">Test Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use test mode for development and testing
                </p>
              </div>
              <Switch
                id="test-mode"
                checked={settings.testMode}
                onCheckedChange={(checked) => setSettings({ ...settings, testMode: checked })}
              />
            </div>

            <Separator />

            {/* Stripe Configuration */}
            {settings.gateway === 'stripe' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Stripe Configuration</h3>
                <div className="space-y-2">
                  <Label htmlFor="stripe-api-key">Stripe API Key</Label>
                  <Input
                    id="stripe-api-key"
                    type="password"
                    value={settings.stripeApiKey}
                    onChange={(e) => setSettings({ ...settings, stripeApiKey: e.target.value })}
                    placeholder="pk_test_..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripe-secret-key">Stripe Secret Key</Label>
                  <Input
                    id="stripe-secret-key"
                    type="password"
                    value={settings.stripeSecretKey}
                    onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                    placeholder="sk_test_..."
                  />
                </div>
              </div>
            )}

            {/* PayPal Configuration */}
            {settings.gateway === 'paypal' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">PayPal Configuration</h3>
                <div className="space-y-2">
                  <Label htmlFor="paypal-client-id">PayPal Client ID</Label>
                  <Input
                    id="paypal-client-id"
                    value={settings.paypalClientId}
                    onChange={(e) => setSettings({ ...settings, paypalClientId: e.target.value })}
                    placeholder="Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paypal-secret">PayPal Secret</Label>
                  <Input
                    id="paypal-secret"
                    type="password"
                    value={settings.paypalSecret}
                    onChange={(e) => setSettings({ ...settings, paypalSecret: e.target.value })}
                    placeholder="Secret"
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Test Payment Button */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Test Payment</Label>
                <p className="text-sm text-muted-foreground">
                  Process a test payment to verify your configuration
                </p>
              </div>
              <Button variant="outline" onClick={handleTestPayment}>
                Test Payment
              </Button>
            </div>
          </>
        )}

        <Separator />

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full">
          Save Payment Settings
        </Button>
      </CardContent>
    </Card>
  );
};

