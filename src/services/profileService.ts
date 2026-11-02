import { getSupabaseClient } from '../lib/supabase';
import { UserProfile, PartnerDetail, RecyclerDetail } from '../types';

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;

      // Check for associated organization name if applicable
      let orgName: string | undefined;
      if (data.role === 'organization') {
        const { data: org } = await supabase
          .from('organizations')
          .select('org_name')
          .eq('profile_id', userId)
          .maybeSingle();
        orgName = org?.org_name;
      } else if (data.role === 'partner') {
        const { data: part } = await supabase
          .from('partner_details')
          .select('company_name')
          .eq('profile_id', userId)
          .maybeSingle();
        orgName = part?.company_name;
      } else if (data.role === 'recycler') {
        const { data: rec } = await supabase
          .from('recycler_details')
          .select('facility_name')
          .eq('profile_id', userId)
          .maybeSingle();
        orgName = rec?.facility_name;
      }

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        phone: data.phone,
        role: data.role,
        avatarUrl: data.avatar_url,
        rewardPoints: data.reward_points || 0,
        isVerified: data.is_verified || false,
        createdAt: data.created_at,
        organizationName: orgName
      };
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  },

  async updateProfile(userId: string, updates: { fullName?: string; phone?: string; avatarUrl?: string }) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');

    const payload: Record<string, any> = {};
    if (updates.fullName) payload.full_name = updates.fullName;
    if (updates.phone) payload.phone = updates.phone;
    if (updates.avatarUrl) payload.avatar_url = updates.avatarUrl;

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPartners(): Promise<Array<{ profile: UserProfile; details: PartnerDetail }>> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('partner_details')
        .select(`
          id,
          profile_id,
          company_name,
          license_number,
          fleet_size,
          service_zones,
          approval_status,
          weighing_scale_calibrated_at,
          created_at,
          profiles:profile_id (*)
        `);

      if (error || !data) return [];

      return data.map((item: any) => ({
        profile: {
          id: item.profiles?.id || item.profile_id,
          email: item.profiles?.email || '',
          fullName: item.profiles?.full_name || item.company_name,
          role: 'partner',
          rewardPoints: 0,
          isVerified: item.approval_status === 'approved',
          createdAt: item.profiles?.created_at || item.created_at,
          organizationName: item.company_name
        },
        details: {
          id: item.id,
          profileId: item.profile_id,
          companyName: item.company_name,
          licenseNumber: item.license_number,
          fleetSize: item.fleet_size,
          serviceZones: item.service_zones || [],
          approvalStatus: item.approval_status,
          weighingScaleCalibratedAt: item.weighing_scale_calibrated_at || item.created_at,
          createdAt: item.created_at
        }
      }));
    } catch (err) {
      console.error('Error fetching partners:', err);
      return [];
    }
  },

  async getRecyclers(): Promise<Array<{ profile: UserProfile; details: RecyclerDetail }>> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('recycler_details')
        .select(`
          id,
          profile_id,
          facility_name,
          pollution_control_board_reg,
          facility_address,
          processing_capacity_mt_month,
          certified_technologies,
          approval_status,
          created_at,
          profiles:profile_id (*)
        `);

      if (error || !data) return [];

      return data.map((item: any) => ({
        profile: {
          id: item.profiles?.id || item.profile_id,
          email: item.profiles?.email || '',
          fullName: item.profiles?.full_name || item.facility_name,
          role: 'recycler',
          rewardPoints: 0,
          isVerified: item.approval_status === 'approved',
          createdAt: item.profiles?.created_at || item.created_at,
          organizationName: item.facility_name
        },
        details: {
          id: item.id,
          profileId: item.profile_id,
          facilityName: item.facility_name,
          pollutionControlBoardReg: item.pollution_control_board_reg,
          facilityAddress: item.facility_address,
          processingCapacityMtMonth: item.processing_capacity_mt_month,
          certifiedTechnologies: item.certified_technologies || [],
          approvalStatus: item.approval_status,
          createdAt: item.created_at
        }
      }));
    } catch (err) {
      console.error('Error fetching recyclers:', err);
      return [];
    }
  },

  async approvePartner(partnerDetailId: string, adminId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase
      .from('partner_details')
      .update({
        approval_status: 'approved',
        approved_by: adminId
      })
      .eq('id', partnerDetailId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async approveRecycler(recyclerDetailId: string, adminId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase
      .from('recycler_details')
      .update({
        approval_status: 'approved',
        approved_by: adminId
      })
      .eq('id', recyclerDetailId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
