
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { User } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext, initialAuthState } from './AuthContext';
import { AuthProviderProps } from './types';
import { mapUserRole } from './utils';

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState(initialAuthState);

  // Check for existing session on mount and listen for auth changes
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        handleSession(session);
      }
    );
    
    // Check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking for existing session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setAuthState({
            ...initialAuthState,
            isLoading: false,
          });
          return;
        }
        
        console.log("Existing session:", session?.user?.id);
        handleSession(session);
      } catch (error) {
        console.error("Session restoration error:", error);
        setAuthState({
          ...initialAuthState,
          isLoading: false,
        });
      }
    };

    checkSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle session update
  const handleSession = async (session: Session | null) => {
    if (!session) {
      console.log("No session found");
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      return;
    }
    
    try {
      // Get user profile data from profiles table if available
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, email, role')
        .eq('id', session.user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching user profile:", profileError);
      }
      
      const email = profileData?.email || session.user.email || '';
      
      // Create user object from session and profile data
      const authUser: User = {
        id: session.user.id,
        name: profileData?.name || session.user.email?.split('@')[0] || 'Usuário',
        email: email,
        role: mapUserRole(profileData?.role, email),
      };
      
      console.log("Setting authenticated user:", authUser);
      
      setAuthState({
        isAuthenticated: true,
        user: authUser,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error handling session:", error);
      
      // Fallback with admin email check
      const email = session.user.email || '';
      
      setAuthState({
        isAuthenticated: true,
        user: {
          id: session.user.id,
          name: session.user.email?.split('@')[0] || 'Usuário',
          email: email,
          role: mapUserRole(undefined, email),
        },
        isLoading: false,
      });
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login for:", email);
      
      // Simple validation
      if (!email || !password) {
        return false;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        return false;
      }

      console.log("Login successful:", data.user?.id);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
      }
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
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
