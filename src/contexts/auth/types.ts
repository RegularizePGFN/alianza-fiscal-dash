
import { User, UserRole } from '@/lib/types';

// Auth state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

// Auth context interface
export interface AuthContextProps extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Auth provider props
export interface AuthProviderProps {
  children: React.ReactNode;
}
