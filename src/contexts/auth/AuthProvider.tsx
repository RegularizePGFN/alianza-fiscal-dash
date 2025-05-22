
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { AuthState } from './types';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, UserRole } from '@/lib/types';
import { mapUserRole } from './utils';

// Helper function to map Supabase user to our User type
const mapSupabaseUserToUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    email: supabaseUser.email || '',  // Ensure email is always set, even if empty string
    role: mapUserRole(supabaseUser.role, supabaseUser.email),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const mappedUser = session ? mapSupabaseUserToUser(session.user) : null;
        setAuthState({
          isAuthenticated: session !== null,
          user: mappedUser,
          isLoading: false,
        });
      }
    );

    // Check for existing session
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      }
      const mappedUser = data.session ? mapSupabaseUserToUser(data.session.user) : null;
      setAuthState({
        isAuthenticated: data.session !== null,
        user: mappedUser,
        isLoading: false,
      });
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Modified to return void instead of boolean
  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  // Added missing methods from AuthContextProps
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const mappedUser = mapSupabaseUserToUser(data.user);
        setAuthState(prev => ({
          ...prev,
          user: mappedUser,
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Refresh user error:', error);
      return false;
    }
  };

  // Impersonation functionality
  const [isImpersonating, setIsImpersonating] = useState(false);
  
  const impersonateUser = async (userId: string) => {
    // Implementation would depend on your backend
    setIsImpersonating(true);
    return true;
  };
  
  const stopImpersonating = async () => {
    setIsImpersonating(false);
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      logout, 
      login, 
      refreshUser, 
      impersonateUser, 
      stopImpersonating, 
      isImpersonating 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
