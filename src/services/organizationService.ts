import { getSupabaseClient } from '../lib/supabase';

export const organizationService = {
  async getOrganization(profileId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching organization:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Exception fetching organization:', err);
      return null;
    }
  },

  async getAllOrganizations() {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('org_name', { ascending: true });

      if (error) {
        console.error('Error fetching organizations:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('Exception fetching organizations:', err);
      return [];
    }
  }
};
