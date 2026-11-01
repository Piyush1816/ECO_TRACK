import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'ecotrack_supabase_url';
const STORAGE_KEY_KEY = 'ecotrack_supabase_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
  isConfigured: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  const url = storedUrl || envUrl;
  const anonKey = storedKey || envKey;

  const isConfigured = Boolean(
    url && 
    url.trim() !== '' && 
    url !== 'https://your-project.supabase.co' && 
    anonKey && 
    anonKey.trim() !== '' &&
    anonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  );

  return {
    url,
    anonKey,
    isCustom: Boolean(storedUrl || storedKey),
    isConfigured
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function saveCustomSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
    supabaseInstance = null; // Reset instance so it re-initializes
  }
}

export function clearCustomSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    supabaseInstance = null;
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url || !key) {
      return { success: false, message: 'Both Supabase URL and Anon Key are required.' };
    }
    const testClient = createClient(url, key);
    const { error } = await testClient.from('ewaste_categories').select('count', { count: 'exact', head: true });
    
    // If the table doesn't exist yet, it will return a 404/400 or relation error, but reaching Supabase is confirmed
    if (error && error.message.includes('FetchError')) {
      return { success: false, message: 'Could not connect to Supabase endpoint. Check the project URL.' };
    }
    
    return { success: true, message: 'Connected successfully to Supabase endpoint!' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Connection failed: ${errorMsg}` };
  }
}
