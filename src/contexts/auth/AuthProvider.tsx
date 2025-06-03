
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
    console.log("🔄 [AUTH] Starting handleSession with session:", session?.user?.id || 'null');
    
    if (isProcessingAuthChange.current) {
      console.log("⚠️ [AUTH] Already processing auth change, skipping");
      return;
    }
    isProcessingAuthChange.current = true;
    
    if (!session) {
      console.log("❌ [AUTH] No session found, setting unauthenticated state");
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      isProcessingAuthChange.current = false;
      return;
    }
    
    try {
      console.log("🔍 [AUTH] Session found, fetching user profile for:", session.user.id);
      
      // Get user profile data from profiles table if available
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, email, role')
        .eq('id', session.user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("❌ [AUTH] Error fetching user profile:", profileError);
      } else {
        console.log("✅ [AUTH] Profile data retrieved:", profileData);
      }
      
      const email = profileData?.email || session.user.email || '';
      
      // Log the retrieved role for debugging
      console.log("📋 [AUTH] User role from database:", profileData?.role);
      
      // Create user object from session and profile data
      const authUser: User = {
        id: session.user.id,
        name: profileData?.name || session.user.email?.split('@')[0] || 'Usuário',
        email: email,
        role: mapUserRole(profileData?.role, email),
      };
      
      console.log("👤 [AUTH] Setting authenticated user:", authUser);
      console.log("🎭 [AUTH] User role mapped to:", authUser.role);
      
      setAuthState({
        isAuthenticated: true,
        user: authUser,
        isLoading: false,
      });
      
      console.log("✅ [AUTH] Authentication state updated successfully");
      
    } catch (error) {
      console.error("💥 [AUTH] Error in handleSession:", error);
      console.error("💥 [AUTH] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      
      // Fallback with admin email check
      const email = session.user.email || '';
      
      console.log("🔄 [AUTH] Using fallback authentication for:", email);
      
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
      
      console.log("⚠️ [AUTH] Fallback authentication completed");
    } finally {
      isProcessingAuthChange.current = false;
      console.log("🏁 [AUTH] handleSession completed");
    }
  }, []);

  // Add refreshUser function to update user data
  const refreshUser = useCallback(async () => {
    console.log("🔄 [AUTH] Starting refreshUser");
    
    if (!authState.user) {
      console.log("❌ [AUTH] No user to refresh");
      return false;
    }
    
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("❌ [AUTH] No session found during refresh");
        return false;
      }
      
      console.log("🔍 [AUTH] Refreshing profile for user:", authState.user.id);
      
      // Get updated profile data from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, email, role')
        .eq('id', authState.user.id)
        .single();
      
      if (profileError) {
        console.error("❌ [AUTH] Error fetching updated user profile:", profileError);
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
      
      console.log("✅ [AUTH] Refreshed user data:", updatedUser);
      
      // Update auth state with refreshed user data
      setAuthState(prevState => ({
        ...prevState,
        user: updatedUser
      }));
      
      return true;
    } catch (error) {
      console.error("💥 [AUTH] Error refreshing user data:", error);
      return false;
    }
  }, [authState.user]);

  // Check for existing session on mount and listen for auth changes
  useEffect(() => {
    console.log("🚀 [AUTH] Setting up authentication listeners");
    
    // Set up auth state listener first with debouncing to prevent excessive calls
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔔 [AUTH] Auth state changed:", event, session?.user?.id || 'no user');
        
        // Use timeout to debounce auth state changes
        setTimeout(() => {
          handleSession(session);
        }, 100);
      }
    );
    
    // Check for existing session
    const checkSession = async () => {
      try {
        console.log("🔍 [AUTH] Checking for existing session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ [AUTH] Session check error:", error);
          setAuthState({
            ...initialAuthState,
            isLoading: false,
          });
          return;
        }
        
        console.log("📋 [AUTH] Existing session:", session?.user?.id || 'no session');
        handleSession(session);
      } catch (error) {
        console.error("💥 [AUTH] Session restoration error:", error);
        console.error("💥 [AUTH] Error details:", error instanceof Error ? error.message : 'Unknown error');
        setAuthState({
          ...initialAuthState,
          isLoading: false,
        });
      }
    };

    checkSession();

    // Cleanup subscription
    return () => {
      console.log("🧹 [AUTH] Cleaning up auth listeners");
      subscription.unsubscribe();
    };
  }, [handleSession]);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("🔐 [AUTH] Attempting login for:", email);
      
      // Simple validation
      if (!email || !password) {
        console.log("❌ [AUTH] Missing email or password");
        return false;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ [AUTH] Login error:", error);
        console.error("❌ [AUTH] Login error details:", error.message);
        return false;
      }

      console.log("✅ [AUTH] Login successful for user:", data.user?.id);
      return true;
    } catch (error) {
      console.error("💥 [AUTH] Login exception:", error);
      console.error("💥 [AUTH] Exception details:", error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  };

  // Impersonate user function (only for admins)
  const impersonateUser = async (userId: string): Promise<boolean> => {
    try {
      console.log("🎭 [AUTH] Starting impersonation for user:", userId);
      
      // Check if current user is admin
      if (authState.user?.role !== UserRole.ADMIN) {
        console.error("❌ [AUTH] Impersonation error: Only admins can impersonate users");
        return false;
      }

      // Store original user session before impersonating
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      originalUserSessionRef.current = {
        user: authState.user,
        session: currentSession
      };

      console.log("🔍 [AUTH] Fetching profile for impersonation target:", userId);

      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, email, role')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("❌ [AUTH] Error fetching user profile for impersonation:", profileError);
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

      console.log("✅ [AUTH] Impersonation successful:", impersonatedUser);
      return true;
    } catch (error) {
      console.error("💥 [AUTH] Impersonation error:", error);
      return false;
    }
  };

  // Stop impersonating and return to original user
  const stopImpersonating = async (): Promise<boolean> => {
    try {
      console.log("🔄 [AUTH] Stopping impersonation");
      
      // Check if we have an original user session stored
      if (!originalUserSessionRef.current) {
        console.error("❌ [AUTH] No original user session found");
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

      console.log("✅ [AUTH] Stopped impersonating, returned to original user");
      return true;
    } catch (error) {
      console.error("💥 [AUTH] Error stopping impersonation:", error);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log("🚪 [AUTH] Starting logout process");
      
      // If impersonating, just return to original user instead of full logout
      if (authState.user?.isImpersonated) {
        console.log("🎭 [AUTH] Stopping impersonation instead of full logout");
        await stopImpersonating();
        return;
      }

      // Regular logout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ [AUTH] Logout error:", error);
      } else {
        console.log("✅ [AUTH] Logout successful");
      }
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });

      // Clear any stored original user session
      originalUserSessionRef.current = null;
      console.log("🧹 [AUTH] Auth state cleared");
    } catch (error) {
      console.error("💥 [AUTH] Logout exception:", error);
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
