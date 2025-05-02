
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { User, UserRole } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext, initialAuthState } from './AuthContext';
import { AuthProviderProps } from './types';
import { mapUserRole } from './utils';

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState(initialAuthState);

  // Function to fetch and set user profile data
  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      
      // Get user profile data from profiles table if available
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, email, role')
        .eq('id', userId)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching user profile:", profileError);
        return null;
      }
      
      console.log("Profile data retrieved:", profileData);
      console.log("User role from database:", profileData?.role);
      
      return {
        id: userId,
        name: profileData?.name || email?.split('@')[0] || 'Usuário',
        email: profileData?.email || email,
        role: mapUserRole(profileData?.role, email),
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Check for existing session on mount and listen for auth changes
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (session) {
          const email = session.user.email || '';
          const userProfile = await fetchUserProfile(session.user.id, email);
          
          if (userProfile) {
            console.log("Setting authenticated user with role:", userProfile.role);
            setAuthState({
              isAuthenticated: true,
              user: userProfile,
              isLoading: false,
            });
          } else {
            // Fallback with admin email check
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
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        }
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
        
        if (session) {
          console.log("Existing session found:", session.user.id);
          const email = session.user.email || '';
          const userProfile = await fetchUserProfile(session.user.id, email);
          
          if (userProfile) {
            console.log("Setting authenticated user with role:", userProfile.role);
            setAuthState({
              isAuthenticated: true,
              user: userProfile,
              isLoading: false,
            });
          } else {
            // Fallback with admin email check
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
        } else {
          console.log("No session found");
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        }
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
    
    const email = session.user.email || '';
    const userProfile = await fetchUserProfile(session.user.id, email);
    
    if (userProfile) {
      console.log("Setting authenticated user with role:", userProfile.role);
      setAuthState({
        isAuthenticated: true,
        user: userProfile,
        isLoading: false,
      });
    } else {
      // Fallback with admin email check
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

  // Function to refresh user data - this will help when user roles are updated
  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await handleSession(session);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
