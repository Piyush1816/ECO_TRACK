import { getSupabaseClient, getSupabaseConfig } from '../lib/supabase';
import { UserRole, UserProfile } from '../types';

export const DEMO_CREDENTIALS: Record<UserRole, { email: string; name: string }> = {
  citizen: { email: 'citizen@ecotrack.org', name: 'Sarah Jenkins' },
  partner: { email: 'partner@ecotrack.org', name: 'David Vance' },
  recycler: { email: 'recycler@ecotrack.org', name: 'Dr. Elena Ramos' },
  organization: { email: 'org@ecotrack.org', name: 'Marcus Sterling' },
  admin: { email: 'admin@ecotrack.org', name: 'Priya Sharma' }
};

export const DEMO_DEFAULT_PASSWORD = 'EcoTrack2026!';

export interface AuthResponse<T = unknown> {
  data: T | null;
  error: Error | null;
}

export const authService = {
  async signUp(params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    organizationName?: string;
  }): Promise<AuthResponse<{ user: any; profile: UserProfile | null }>> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { data: null, error: new Error('Supabase is not configured. Please provide Supabase URL and Anon Key.') };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            full_name: params.fullName,
            role: params.role,
            phone: params.phone,
            organization_name: params.organizationName
          }
        }
      });

      if (authError) {
        return { data: null, error: authError };
      }

      if (!authData.user) {
        return { data: null, error: new Error('User signup failed without error message.') };
      }

      // Check if profile was created by trigger, or insert manually as fallback
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      let profile: UserProfile | null = null;
      if (profileData) {
        profile = {
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.full_name,
          phone: profileData.phone,
          role: profileData.role,
          avatarUrl: profileData.avatar_url,
          rewardPoints: profileData.reward_points || 0,
          isVerified: profileData.is_verified || false,
          createdAt: profileData.created_at,
          organizationName: params.organizationName
        };
      }

      return { data: { user: authData.user, profile }, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  async signIn(email: string, password: string): Promise<AuthResponse<{ user: any; profile: UserProfile | null }>> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { data: null, error: new Error('Supabase is not configured. Please provide Supabase URL and Anon Key in Database Setup.') };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return { data: null, error: authError };
      }

      if (!authData.user) {
        return { data: null, error: new Error('Authentication returned no user.') };
      }

      // Fetch profile from database to get the genuine role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.warn('Profile fetch error after login:', profileError);
      }

      const profile: UserProfile = profileData ? {
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.full_name,
        phone: profileData.phone,
        role: profileData.role,
        avatarUrl: profileData.avatar_url,
        rewardPoints: profileData.reward_points || 0,
        isVerified: profileData.is_verified || false,
        createdAt: profileData.created_at
      } : {
        id: authData.user.id,
        email: authData.user.email || email,
        fullName: authData.user.user_metadata?.full_name || email.split('@')[0],
        phone: authData.user.user_metadata?.phone,
        role: (authData.user.user_metadata?.role as UserRole) || 'citizen',
        rewardPoints: 0,
        isVerified: true,
        createdAt: new Date().toISOString()
      };

      return { data: { user: authData.user, profile }, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  async signInDemoPersona(role: UserRole, customPassword?: string): Promise<AuthResponse<{ user: any; profile: UserProfile | null }>> {
    const creds = DEMO_CREDENTIALS[role];
    const password = customPassword || DEMO_DEFAULT_PASSWORD;
    const res = await this.signIn(creds.email, password);
    
    if (res.error) {
      // Provide actionable feedback if user hasn't provisioned demo accounts yet
      const errorMsg = res.error.message.toLowerCase();
      if (errorMsg.includes('invalid login credentials') || errorMsg.includes('user not found')) {
        return {
          data: null,
          error: new Error(
            `Demo account (${creds.email}) is not yet provisioned in your Supabase Auth project. Run 'npm run seed:demo' or register via the 'Register Role' tab.`
          )
        };
      }
    }
    return res;
  },

  async signOut(): Promise<{ error: Error | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: null };
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: new Error('Supabase is not configured.') };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  async getCurrentSession() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { unsubscribe: () => {} };
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return {
      unsubscribe: () => subscription.unsubscribe()
    };
  }
};
