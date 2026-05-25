'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

// ============================================================
// Types
// ============================================================

export type UserRole =
  | 'ADMIN'
  | 'SOURCING_MANAGER'
  | 'FACTORY_MANAGER'
  | 'SALES_MANAGER'
  | 'WAREHOUSE_MANAGER'
  | 'DISTRIBUTION_MANAGER'
  | 'SALES_PERSON';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  location: string | null;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  // Role check helpers
  isAdmin: boolean;
  isSourcingManager: boolean;
  isFactoryManager: boolean;
  isSalesManager: boolean;
  isWarehouseManager: boolean;
  isDistributionManager: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// Auth Provider
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from the profiles table
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Failed to fetch profile:', error.message);
      return null;
    }
    return data as Profile;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      setProfile(p);
    }
  }, [user, fetchProfile]);

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (initialSession?.user) {
          setUser(initialSession.user);
          setSession(initialSession);
          const p = await fetchProfile(initialSession.user.id);
          setProfile(p);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const p = await fetchProfile(newSession.user.id);
          setProfile(p);
        } else {
          setProfile(null);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Auth actions
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'SALES_PERSON') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    toast.success('Logged out successfully');
    // Use window.location for a hard redirect to fully reset app state
    window.location.href = '/login';
  };

  // Role check helpers
  const role = profile?.role ?? null;
  const isAdmin = role === 'ADMIN';
  const isSourcingManager = role === 'SOURCING_MANAGER' || isAdmin;
  const isFactoryManager = role === 'FACTORY_MANAGER' || isAdmin;
  const isSalesManager = role === 'SALES_MANAGER' || isAdmin;
  const isWarehouseManager = role === 'WAREHOUSE_MANAGER' || isAdmin;
  const isDistributionManager = role === 'DISTRIBUTION_MANAGER' || isAdmin;

  const hasRole = (roles: UserRole[]) => {
    if (isAdmin) return true;
    return role ? roles.includes(role) : false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        isAdmin,
        isSourcingManager,
        isFactoryManager,
        isSalesManager,
        isWarehouseManager,
        isDistributionManager,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// Hook: useAuth
// ============================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Convenience alias
export const useUserRole = () => {
  const { role, profile, hasRole, isAdmin, isSourcingManager, isFactoryManager, isSalesManager, isWarehouseManager, isDistributionManager } = useAuth();
  return { role, profile, hasRole, isAdmin, isSourcingManager, isFactoryManager, isSalesManager, isWarehouseManager, isDistributionManager };
};
