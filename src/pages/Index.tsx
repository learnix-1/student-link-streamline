
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import Layout from '@/components/layout/Layout';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout requireAuth={false}>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2 animate-fade-in">
            PlaceTrack
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Streamlined placement management for educational institutions
          </p>
        </div>
        <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
