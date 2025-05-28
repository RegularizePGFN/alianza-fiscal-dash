
import { createContext, useContext } from 'react';
import { AuthContextProps, AuthState } from './types';

// Initial auth state
export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
};

// Create the auth context
export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
