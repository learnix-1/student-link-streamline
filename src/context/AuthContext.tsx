
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthState } from '../types';
import { authenticateUser, getUserData } from '../lib/data';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  userData: any | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  role: null,
  login: async () => false,
  logout: () => {},
  userData: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedUser = localStorage.getItem('user');
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      isAuthenticated: !!savedUser,
      role: savedUser ? JSON.parse(savedUser).role as UserRole : null,
    };
  });
  
  const [userData, setUserData] = useState<any | null>(null);

  useEffect(() => {
    if (authState.user) {
      const data = getUserData(authState.user);
      setUserData(data);
    } else {
      setUserData(null);
    }
  }, [authState.user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = authenticateUser(email, password);
      
      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          role: user.role,
        });
        
        localStorage.setItem('user', JSON.stringify(user));
        toast.success(`Welcome, ${user.name}!`);
        return true;
      } else {
        toast.error('Invalid credentials. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login. Please try again.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      role: null,
    });
    toast.info('You have been logged out.');
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        userData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
