
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('admin@haca.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="glass border-0 shadow-lg overflow-hidden transition-all duration-500">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold">PlaceTrack</CardTitle>
          <CardDescription className="mt-2">Sign in to access your placement management system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="focus:ring-2 focus:ring-accent"
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium leading-none">
                    Password
                  </label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="focus:ring-2 focus:ring-accent"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center text-sm text-muted-foreground">
          <p>Default credentials:</p>
          <p>Email: admin@haca.com | Password: password</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm;
