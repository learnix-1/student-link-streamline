import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';
import { toast } from 'sonner';

interface AuthContextData {
  isAuthenticated: boolean;
  userData: any | null;
  role: UserRole | null;
  user: any | null;
  refreshAuthData: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({
  isAuthenticated: false,
  userData: null,
  role: null,
  user: null,
  refreshAuthData: async () => {},
  logout: async () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuthData = async () => {
    try {
      // Get current auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (!session) {
        setIsAuthenticated(false);
        setUserData(null);
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }
      
      const currentUser = session.user;
      setUser(currentUser);
      setIsAuthenticated(true);
      
      // Get user role from metadata
      const userRole = currentUser?.user_metadata?.role || 'placement_officer';
      setRole(userRole as UserRole);
      
      // Fetch demo data (this would be replaced with real data fetching in a production app)
      const { demoData } = await import('@/lib/data');
      setUserData(demoData);
      
      // In a real application, you would fetch user-specific data here
      // For example:
      /*
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('*');
        
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*');
        
      // ... fetch other data
      
      setUserData({
        schools,
        students,
        // ... other data
      });
      */
      
    } catch (error) {
      console.error('Error refreshing auth data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserData(null);
      setUser(null);
      setRole(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to log out');
    }
  };

  useEffect(() => {
    refreshAuthData();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await refreshAuthData();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserData(null);
        setUser(null);
        setRole(null);
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    isAuthenticated,
    userData,
    role,
    user,
    refreshAuthData,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
