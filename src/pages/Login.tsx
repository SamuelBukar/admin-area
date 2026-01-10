import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { twoFactorApi } from '@/lib/api';
import { Separator } from '@/components/ui/separator';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [userHas2FA, setUserHas2FA] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      // Check if user has 2FA enabled (in production, this would come from API)
      // For demo, check localStorage for user data
      const savedUser = localStorage.getItem('landadmin-user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.twoFactorEnabled) {
          setUserHas2FA(true);
          setNeeds2FA(true);
          // Send 2FA code
          await twoFactorApi.sendCode(email);
          toast.success('Verification code sent to your email');
          setIsLoading(false);
          return;
        }
      }

      // No 2FA, proceed with login
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await twoFactorApi.verifyCode(email, code);
      if (isValid) {
        await login(email, password);
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid verification code. Please try again.');
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsSendingCode(true);
    try {
      await twoFactorApi.sendCode(email);
      toast.success('Verification code resent to your email');
    } catch (error) {
      toast.error('Failed to resend code. Please try again.');
    } finally {
      setIsSendingCode(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | LandAdmin Builder</title>
        <meta name="description" content="Login to LandAdmin Builder" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-canvas via-background to-muted p-4">
        <Card className="w-full max-w-md shadow-widget-hover">
          <CardHeader className="space-y-3 text-center">
            <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto">
              <span className="text-3xl font-bold text-primary-foreground">LA</span>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your LandAdmin Builder account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!needs2FA ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handle2FASubmit} className="space-y-4">
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
                    disabled={isLoading}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Enter the 6-digit code sent to {email}
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendCode}
                  disabled={isSendingCode}
                >
                  {isSendingCode ? 'Sending...' : 'Resend Code'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setNeeds2FA(false);
                    setCode('');
                  }}
                >
                  Back to Login
                </Button>
              </form>
            )}

            <Separator className="my-6" />
            
            {/* Demo Accounts */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-center text-muted-foreground">
                Demo Accounts
              </p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { email: 'admin@demo.com', password: 'demo123', role: 'Admin', color: 'bg-red-500' },
                  { email: 'user@demo.com', password: 'demo123', role: 'User', color: 'bg-blue-500' },
                ].map((account) => (
                  <Button
                    key={account.email}
                    type="button"
                    variant="outline"
                    className="w-full justify-between h-auto py-3"
                    onClick={async () => {
                      setEmail(account.email);
                      setPassword(account.password);
                      setIsLoading(true);
                      try {
                        await login(account.email, account.password);
                        toast.success(`Logged in as ${account.role}`);
                        navigate('/dashboard');
                      } catch (error) {
                        toast.error('Login failed. Please try again.');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${account.color}`} />
                      <div className="text-left">
                        <div className="text-sm font-medium">{account.role}</div>
                        <div className="text-xs text-muted-foreground">{account.email}</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {account.password}
                    </Badge>
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Click any demo account to login instantly
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Login;

