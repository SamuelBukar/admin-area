import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSend2FA, useVerify2FA } from '@/hooks/useQueries';

interface Enable2FAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  onSuccess: () => void;
}

export const Enable2FAModal = ({ open, onOpenChange, userEmail, onSuccess }: Enable2FAModalProps) => {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const send2FAMutation = useSend2FA();
  const verify2FAMutation = useVerify2FA();

  const handleRequestCode = async () => {
    setIsSending(true);
    try {
      await send2FAMutation.mutateAsync(userEmail);
      toast.success('Verification code sent to your email');
      setStep('verify');
    } catch (error) {
      toast.error('Failed to send code. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await verify2FAMutation.mutateAsync({ email: userEmail, code });
      // auth API simply resolves if success
      toast.success('Two-factor authentication enabled');
      onSuccess();
      onOpenChange(false);
      setStep('request');
      setCode('');
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('request');
    setCode('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'request' ? 'Enable Two-Factor Authentication' : 'Verify Code'}
          </DialogTitle>
          <DialogDescription>
            {step === 'request'
              ? 'We will send a 6-digit verification code to your email address.'
              : 'Enter the 6-digit code sent to your email.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'request' ? (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Code will be sent to: <strong>{userEmail}</strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code from your email
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 'request' ? (
            <Button onClick={handleRequestCode} disabled={isSending}>
              {isSending ? 'Sending...' : 'Send Code'}
            </Button>
          ) : (
            <Button onClick={handleVerifyCode} disabled={isLoading || code.length !== 6}>
              {isLoading ? 'Verifying...' : 'Verify & Enable'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

