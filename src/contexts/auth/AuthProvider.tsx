import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { AuthState } from './types';
import { supabase } from '@/integrations/supabase/client';

// Remove any Router components that might be here
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const session = supabase.auth.getSession();

    setAuthState({
      isAuthenticated: session?.data?.session !== null,
      user: session?.data?.session?.user || null,
      isLoading: false,
    });

    supabase.auth.onAuthStateChange((event, session) => {
      setAuthState({
        isAuthenticated: session !== null,
        user: session?.user || null,
        isLoading: false,
      });
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
