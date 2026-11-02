import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types';
import { authService, DEMO_CREDENTIALS } from '../services/authService';
import { profileService } from '../services/profileService';
import { getSupabaseConfig, getSupabaseClient } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginDemoPersona: (role: UserRole, customPassword?: string) => Promise<{ success: boolean; error?: string }>;
  register: (params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    organizationName?: string;
  }) => Promise<{ success: boolean; error?: string; emailConfirmationRequired?: boolean }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const config = getSupabaseConfig();
  const isConfigured = config.isConfigured;

  // Fetch genuine profile from PostgreSQL
  const loadProfile = async (authUserId: string, fallbackRole?: UserRole) => {
    try {
      const p = await profileService.getProfile(authUserId);
      if (p) {
        setProfile(p);
      } else {
        // Fallback user profile if newly created before trigger completion
        setProfile({
          id: authUserId,
          email: user?.email || '',
          fullName: user?.user_metadata?.full_name || 'Authenticated User',
          phone: user?.user_metadata?.phone,
          role: fallbackRole || (user?.user_metadata?.role as UserRole) || 'citizen',
          rewardPoints: 0,
          isVerified: true,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Could not load database profile:', err);
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const currentSession = await authService.getCurrentSession();
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await loadProfile(currentSession.user.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen to real Supabase session events
    const { unsubscribe } = authService.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        await loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [isConfigured]);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    const res = await authService.signIn(email, password);
    setLoading(false);

    if (res.error) {
      setError(res.error.message);
      return { success: false, error: res.error.message };
    }

    if (res.data?.user) {
      setUser(res.data.user);
      if (res.data.profile) {
        setProfile(res.data.profile);
      } else {
        await loadProfile(res.data.user.id);
      }
      return { success: true };
    }

    return { success: false, error: 'Unknown authentication failure.' };
  };

  const loginDemoPersona = async (role: UserRole, customPassword?: string) => {
    setError(null);
    setLoading(true);
    const res = await authService.signInDemoPersona(role, customPassword);
    setLoading(false);

    if (res.error) {
      setError(res.error.message);
      return { success: false, error: res.error.message };
    }

    if (res.data?.user) {
      setUser(res.data.user);
      if (res.data.profile) {
        setProfile(res.data.profile);
      } else {
        await loadProfile(res.data.user.id, role);
      }
      return { success: true };
    }

    return { success: false, error: 'Demo persona login failed.' };
  };

  const register = async (params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    organizationName?: string;
  }) => {
    setError(null);
    setLoading(true);
    const res = await authService.signUp(params);
    setLoading(false);

    if (res.error) {
      setError(res.error.message);
      return { success: false, error: res.error.message };
    }

    // Check if email confirmation is required
    const emailConfirmationRequired = res.data?.user && !res.data.user.confirmed_at && !res.data.user.email_confirmed_at;

    if (res.data?.user) {
      setUser(res.data.user);
      if (res.data.profile) {
        setProfile(res.data.profile);
      }
    }

    return { 
      success: true, 
      emailConfirmationRequired: Boolean(emailConfirmationRequired) 
    };
  };

  const logout = async () => {
    setLoading(true);
    await authService.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    const res = await authService.resetPassword(email);
    if (res.error) {
      return { success: false, error: res.error.message };
    }
    return { success: true };
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  const effectiveRole: UserRole = profile?.role || 'citizen';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: effectiveRole,
        session,
        loading,
        error,
        isConfigured,
        login,
        loginDemoPersona,
        register,
        logout,
        resetPassword,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
