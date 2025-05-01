
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User, UserRole } from '@/lib/types';
import { MOCK_USERS } from '@/lib/constants';

// Initial auth state
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
};

// Context interface
interface AuthContextProps extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const storedUser = localStorage.getItem('afUser');
        
        if (storedUser) {
          const user = JSON.parse(storedUser) as User;
          setAuthState({
            isAuthenticated: true,
            user,
            isLoading: false,
          });
        } else {
          setAuthState({
            ...initialAuthState,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Session restoration error:', error);
        setAuthState({
          ...initialAuthState,
          isLoading: false,
        });
      }
    };

    checkSession();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would make an API call to validate credentials
    // For now, we'll simulate with our mock data
    try {
      // Simple validation
      if (!email || !password) {
        return false;
      }

      // For demo purposes, password is not checked
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (user) {
        const authUser: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
        };

        // Store the user in localStorage
        localStorage.setItem('afUser', JSON.stringify(authUser));

        // Update auth state
        setAuthState({
          isAuthenticated: true,
          user: authUser,
          isLoading: false,
        });

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('afUser');
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
