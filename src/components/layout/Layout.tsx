
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, requireAuth]);

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {isAuthenticated && <Navbar />}
      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-fade-up">
        {children}
      </main>
      <footer className="border-t border-border py-4 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} PlaceTrack. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
