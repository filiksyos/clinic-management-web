'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthResponse, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Define possible user roles
type UserRole = 'receptionist' | 'doctor' | null;

type AuthContextType = {
  user: User | null;
  session: Session | null;
  userRole: UserRole; // Add userRole to the context type
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>; // Update signOut return type
};

// Create a default context
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRole: null, // Initialize userRole as null
  isLoading: true,
  signIn: async () => ({ data: { user: null, session: null }, error: null }),
  signOut: async () => ({ error: null }), // Update default signOut
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // We start with null for user and session, but track whether we're loading
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null); // Add state for userRole
  const [isLoading, setIsLoading] = useState(true);

  // Function to extract role from user metadata
  const extractUserRole = (user: User | null): UserRole => {
    if (!user) return null;
    
    // Get role from app_metadata (preferred)
    const appRole = user.app_metadata?.role as UserRole;
    if (appRole === 'receptionist' || appRole === 'doctor') {
      return appRole;
    }
    
    // Fallback: Get role from user metadata if not in app_metadata
    const userRoleMeta = user.user_metadata?.role as UserRole;
     if (userRoleMeta === 'receptionist' || userRoleMeta === 'doctor') {
      return userRoleMeta;
    }

    console.warn('User role not found or invalid in metadata:', user.app_metadata, user.user_metadata);
    return null; // Return null if role is not found or invalid
  };

  // Function to handle role-based redirection
  const handleRoleBasedRedirection = (role: UserRole) => {
    if (typeof window === 'undefined') return; // Ensure this runs only client-side

    if (!role) {
        console.log("No role found, redirecting to login.");
        window.location.href = '/'; // Redirect to login if no role
        return;
    }
    
    console.log(`Redirecting user with role: ${role}`);
    // Redirect based on role
    switch (role) {
      case 'receptionist':
        window.location.href = '/dashboard/receptionist';
        break;
      case 'doctor':
        // Redirect doctors to their specific dashboard
        window.location.href = '/doctor/dashboard'; 
        break;
      default:
        // Redirect to login if role is not recognized
        console.log("Unrecognized role, redirecting to login.");
        window.location.href = '/';
    }
  };

  // This effect runs once on component mount
  useEffect(() => {
    // Set up initial session
    const setupSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        
        // Update based on current session
        const currentUser = session?.user ?? null;
        setSession(session);
        setUser(currentUser);
        
        // Extract and set user role
        const role = extractUserRole(currentUser);
        setUserRole(role);
        console.log("Initial session role:", role);

      } catch (error) {
        console.error('Unexpected error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      const currentUser = session?.user ?? null;
      setSession(session);
      setUser(currentUser);
      
      // Extract and set user role
      const role = extractUserRole(currentUser);
      setUserRole(role);
      console.log("Auth change event role:", role);
      
      // If user just signed in, redirect based on role
      // Avoid redirecting if already on the target page or during initial load
      if (event === 'SIGNED_IN' && role) {
         // Check if redirection is needed to avoid loops
         const currentPath = window.location.pathname;
         const targetPath = role === 'receptionist' ? '/dashboard/receptionist' : '/doctor/dashboard';
         if (currentPath !== targetPath) {
           handleRoleBasedRedirection(role);
         }
      } else if (event === 'SIGNED_OUT') {
          // Redirect to login on sign out
          if (window.location.pathname !== '/') {
             window.location.href = '/';
          }
      }
      
      // Set loading to false only after processing the auth state
      // Delay setting loading to false slightly to allow redirection logic to potentially trigger
      // This might need adjustment based on observed behavior
      setTimeout(() => setIsLoading(false), 50); 
    });

    // Call setup
    setupSession();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencies removed to ensure it runs only once on mount

  // Sign in function
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // Sign in with Supabase
      const authResponse = await supabase.auth.signInWithPassword({ email, password });
      
      // Redirection is handled by the onAuthStateChange listener 
      return authResponse; 

    } catch (error) {
      console.error('Sign in error:', error);
      // Check if it's an AuthError, otherwise create a generic one
      const authError = error instanceof AuthError 
        ? error 
        : new AuthError((error as Error)?.message || 'An unknown error occurred during sign in.');
      return { data: { user: null, session: null }, error: authError };
    } finally {
       // isLoading state is primarily managed by onAuthStateChange now
    }
  };

  // Sign out function
  const signOut = async (): Promise<{ error: AuthError | null }> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      // Redirection handled by onAuthStateChange
      return { error };
    } catch (error) {
        console.error('Unexpected Sign out error:', error);
         const authError = error instanceof AuthError 
            ? error 
            : new AuthError((error as Error)?.message || 'An unknown error occurred during sign out.');
        return { error: authError };
    } finally {
       // isLoading state is primarily managed by onAuthStateChange now
    }
  };

  // Create context value
  const value: AuthContextType = {
    user,
    session,
    userRole, // Expose userRole
    isLoading,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
   if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 