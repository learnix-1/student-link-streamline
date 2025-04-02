
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const LoginForm = () => {
  const { refreshAuthData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Special case for admin@haca.com
    if (email === 'admin@haca.com' && password === 'Password') {
      try {
        // First try to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        // If error indicates user doesn't exist, create admin account
        if (signInError && signInError.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: 'Admin',
                role: 'master_admin'
              },
              emailRedirectTo: window.location.origin
            }
          });

          if (signUpError) throw signUpError;
          
          // Auto-confirm admin user
          try {
            const { error: adminConfirmError } = await supabase.auth.admin.updateUserById(
              signUpData?.user?.id as string,
              { email_confirm: true }
            );
            
            if (adminConfirmError) {
              console.error("Error confirming admin:", adminConfirmError);
              // Still proceed with login attempt as this may be a permissions issue
            }
          } catch (confirmError) {
            console.error("Admin confirmation error:", confirmError);
            // Continue with sign-in attempt
          }
          
          toast.success('Admin account created successfully');
          
          // Try to sign in after creating account
          const { error: postSignUpError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (postSignUpError) throw postSignUpError;
          
          await refreshAuthData();
        } else if (signInError) {
          throw signInError;
        } else {
          // Login successful
          await refreshAuthData();
          toast.success('Admin logged in successfully');
        }
      } catch (error: any) {
        toast.error(error.message || 'Authentication failed');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      if (isRegister) {
        // Register new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              role: 'placement_officer' // Default role for new users
            },
            emailRedirectTo: window.location.origin
          }
        });

        if (error) throw error;
        
        // After registration, manually update the user to confirm their email
        // This simulates auto-confirmation
        if (data.user) {
          try {
            // Try to auto sign-in after registration
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (signInError) {
              toast.success('Registration successful! Please check your email for verification.');
              setIsRegister(false);
            } else {
              await refreshAuthData();
              toast.success('Registration and login successful!');
            }
          } catch (innerError: any) {
            console.error("Error during auto-login:", innerError);
            toast.success('Registration successful! Please check your email for verification.');
            setIsRegister(false);
          }
        }
      } else {
        // Log in existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        
        await refreshAuthData();
        toast.success('Logged in successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isRegister ? 'Create an Account' : 'Sign In'}</CardTitle>
        <CardDescription>
          {isRegister 
            ? 'Enter your details to create a new account' 
            : 'Enter your credentials to sign in to your account'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleAuth}>
        <CardContent className="space-y-4">
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {!isRegister && (
                <Button 
                  variant="link" 
                  className="px-0 font-normal text-sm"
                  type="button"
                  onClick={() => toast.info('Password reset functionality would be implemented here.')}
                >
                  Forgot password?
                </Button>
              )}
            </div>
            <Input 
              id="password" 
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading 
              ? (isRegister ? 'Creating Account...' : 'Signing In...') 
              : (isRegister ? 'Create Account' : 'Sign In')
            }
          </Button>
          <p className="text-center text-sm">
            {isRegister ? 'Already have an account?' : 'Don\'t have an account?'}
            {' '}
            <Button 
              variant="link" 
              className="p-0" 
              type="button"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Sign in' : 'Create one'}
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
