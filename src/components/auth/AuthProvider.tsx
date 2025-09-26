'use client';

/**
 * Authentication Provider Component
 * Provides authentication context throughout the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createSupabaseClient,
  getCurrentSession,
  getUserProfile,
  type AuthUser,
  type AuthSession,
  type UserProfile
} from '../../lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize Supabase client
  const supabase = createSupabaseClient();

  // Load user profile
  const loadUserProfile = async (userId: string) => {
    const { success, profile: userProfile } = await getUserProfile(userId);
    if (success && userProfile) {
      setProfile(userProfile);
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  };

  // Sign out function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      const { session: initialSession, user: initialUser } = await getCurrentSession();

      setSession(initialSession);
      setUser(initialUser);

      if (initialUser) {
        await loadUserProfile(initialUser.id);
      }

      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('Auth state changed:', event, session?.user?.email);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
        }

        setLoading(false);

        // Handle auth events
        if (event === 'SIGNED_IN') {
          // Redirect to dashboard or profile completion
          if (session?.user) {
            const { success, profile: userProfile } = await getUserProfile(session.user.id);
            if (success && userProfile) {
              // Check if profile is complete
              const isComplete = !!(
                userProfile.university &&
                userProfile.academic_level &&
                userProfile.research_interests &&
                userProfile.research_interests.length > 0
              );

              if (isComplete) {
                router.push('/dashboard');
              } else {
                router.push('/auth/profile-setup');
              }
            } else {
              router.push('/auth/profile-setup');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          router.push('/auth/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}