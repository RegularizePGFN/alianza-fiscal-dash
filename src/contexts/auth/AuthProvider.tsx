
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { AuthState } from './types';
import { supabase } from '@/integrations/supabase/client';

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
        setAuthState({
          isAuthenticated: session !== null,
          user: session?.user || null,
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
      setAuthState({
        isAuthenticated: data.session !== null,
        user: data.session?.user || null,
        isLoading: false,
      });
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
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
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setAuthState(prev => ({
          ...prev,
          user: data.user,
        }));
        return { success: true };
      }
      return { success: false, error: "Could not refresh user" };
    } catch (error: any) {
      console.error('Refresh user error:', error);
      return { success: false, error: error.message };
    }
  };

  // Impersonation functionality
  const [isImpersonating, setIsImpersonating] = useState(false);
  
  const impersonateUser = async (userId: string) => {
    // Implementation would depend on your backend
    setIsImpersonating(true);
    return { success: true };
  };
  
  const stopImpersonating = async () => {
    setIsImpersonating(false);
    return { success: true };
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
