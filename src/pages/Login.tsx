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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      // if ApiError from our client, show server message if available
      const msg = error?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
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

          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Login;

