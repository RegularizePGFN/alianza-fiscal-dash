
import { useState, useEffect, useCallback, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { User, UserRole } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext, initialAuthState } from './AuthContext';
import { AuthProviderProps } from './types';
import { mapUserRole } from './utils';

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState(initialAuthState);
  
  // Add reference to track processing state to prevent duplicate updates
  const isProcessingAuthChange = useRef(false);

  // Handle session update - memoized to prevent recreating on each render
  const handleSession = useCallback(async (session: Session | null) => {
    if (isProcessingAuthChange.current) return;
    isProcessingAuthChange.current = true;
    
    if (!session) {
      console.log("No session found");
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      isProcessingAuthChange.current = false;
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
      
      // Log the retrieved role for debugging
      console.log("Profile data retrieved:", profileData);
      console.log("User role from database:", profileData?.role);
      
      // Create user object from session and profile data
      const authUser: User = {
        id: session.user.id,
        name: profileData?.name || session.user.email?.split('@')[0] || 'Usuário',
        email: email,
        role: mapUserRole(profileData?.role, email),
      };
      
      console.log("Setting authenticated user:", authUser);
      console.log("With role:", authUser.role);
      
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
    } finally {
      isProcessingAuthChange.current = false;
    }
  }, []);

  // Check for existing session on mount and listen for auth changes
  useEffect(() => {
    // Set up auth state listener first with debouncing to prevent excessive calls
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        // Use timeout to debounce auth state changes
        setTimeout(() => {
          handleSession(session);
        }, 100);
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
  }, [handleSession]);

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
