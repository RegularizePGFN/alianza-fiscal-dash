
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
  
  // Reference to store original user session when impersonating
  const originalUserSessionRef = useRef<{ user: User | null, session: Session | null } | null>(null);

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

  // Add refreshUser function to update user data
  const refreshUser = useCallback(async () => {
    if (!authState.user) return false;
    
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return false;
      
      // Get updated profile data from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, email, role')
        .eq('id', authState.user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching updated user profile:", profileError);
        return false;
      }
      
      const email = profileData?.email || session.user.email || '';
      
      // Create updated user object
      const updatedUser: User = {
        ...authState.user,
        name: profileData?.name || authState.user.name,
        email: email,
        role: mapUserRole(profileData?.role, email),
      };
      
      console.log("Refreshing user data:", updatedUser);
      
      // Update auth state with refreshed user data
      setAuthState(prevState => ({
        ...prevState,
        user: updatedUser
      }));
      
      return true;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return false;
    }
  }, [authState.user]);

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

  // Impersonate user function (only for admins)
  const impersonateUser = async (userId: string): Promise<boolean> => {
    try {
      // Check if current user is admin
      if (authState.user?.role !== UserRole.ADMIN) {
        console.error("Impersonation error: Only admins can impersonate users");
        return false;
      }

      // Store original user session before impersonating
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      originalUserSessionRef.current = {
        user: authState.user,
        session: currentSession
      };

      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, email, role')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Error fetching user profile for impersonation:", profileError);
        return false;
      }

      // Create impersonated user object
      const impersonatedUser: User = {
        id: userId,
        name: profileData.name || 'Usuário',
        email: profileData.email || '',
        role: mapUserRole(profileData.role, profileData.email),
        // Add flag to indicate this is an impersonated session
        isImpersonated: true,
        impersonatedBy: authState.user?.id || ''
      };

      // Update auth state with impersonated user
      setAuthState({
        isAuthenticated: true,
        user: impersonatedUser,
        isLoading: false,
      });

      console.log("Impersonation successful:", impersonatedUser);
      return true;
    } catch (error) {
      console.error("Impersonation error:", error);
      return false;
    }
  };

  // Stop impersonating and return to original user
  const stopImpersonating = async (): Promise<boolean> => {
    try {
      // Check if we have an original user session stored
      if (!originalUserSessionRef.current) {
        console.error("No original user session found");
        return false;
      }

      // Restore original user
      setAuthState({
        isAuthenticated: true,
        user: originalUserSessionRef.current.user,
        isLoading: false,
      });

      // Clear the stored original session
      originalUserSessionRef.current = null;

      console.log("Stopped impersonating, returned to original user");
      return true;
    } catch (error) {
      console.error("Error stopping impersonation:", error);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // If impersonating, just return to original user instead of full logout
      if (authState.user?.isImpersonated) {
        await stopImpersonating();
        return;
      }

      // Regular logout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
      }
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });

      // Clear any stored original user session
      originalUserSessionRef.current = null;
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
        impersonateUser,
        stopImpersonating,
        isImpersonating: !!authState.user?.isImpersonated,
        refreshUser // Add the refreshUser function to the context
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
