
import { User, UserRole } from '@/lib/types';
import { ReactNode } from 'react';

// Auth state
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

// Auth context props
export interface AuthContextProps extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  impersonateUser: (userId: string) => Promise<boolean>;
  stopImpersonating: () => Promise<boolean>;
  isImpersonating: boolean;
  refreshUser: () => Promise<boolean>; // Add refreshUser function
}

// Auth provider props
export interface AuthProviderProps {
  children: ReactNode;
}
