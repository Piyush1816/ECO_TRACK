import { getSupabaseClient } from '../lib/supabase';
import { RewardItem, RewardRedemption } from '../types';

export const rewardService = {
  async getRewards(): Promise<RewardItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      if (error || !data) return [];

      return data.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        pointsRequired: r.points_required,
        sponsorName: r.sponsor_name || 'EcoTrack Initiative',
        voucherCodeSample: r.voucher_code || 'ECO-CLAIM-2026',
        icon: 'Award',
        isActive: r.is_active
      }));
    } catch (err) {
      console.error('Error fetching rewards:', err);
      return [];
    }
  },

  async getRedemptions(userId: string): Promise<RewardRedemption[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          id,
          user_id,
          reward_id,
          points_spent,
          status,
          claim_code,
          redeemed_at,
          rewards:reward_id (title)
        `)
        .eq('user_id', userId)
        .order('redeemed_at', { ascending: false });

      if (error || !data) return [];

      return data.map((d: any) => ({
        id: d.id,
        userId: d.user_id,
        rewardId: d.reward_id,
        rewardTitle: (d.rewards as any)?.title || 'EcoTrack Reward',
        pointsSpent: d.points_spent,
        claimCode: d.claim_code,
        status: d.status,
        redeemedAt: d.redeemed_at
      }));
    } catch (err) {
      console.error('Error fetching redemptions:', err);
      return [];
    }
  },

  async redeemReward(rewardId: string, userId: string): Promise<{ success: boolean; message: string; claimCode?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');

    // 1. Fetch reward and user points
    const { data: reward } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .single();

    if (!reward) {
      return { success: false, message: 'Reward not found.' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('reward_points')
      .eq('id', userId)
      .single();

    const currentPoints = profile?.reward_points || 0;
    if (currentPoints < reward.points_required) {
      return {
        success: false,
        message: `Insufficient points. You have ${currentPoints} points, but ${reward.points_required} are required.`
      };
    }

    const claimCode = `${(reward.voucher_code || 'ECO').split('-')[0]}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 2. Deduct points
    await supabase
      .from('profiles')
      .update({ reward_points: currentPoints - reward.points_required })
      .eq('id', userId);

    // 3. Record redemption
    await supabase
      .from('reward_redemptions')
      .insert({
        user_id: userId,
        reward_id: reward.id,
        points_spent: reward.points_required,
        status: 'issued',
        claim_code: claimCode
      });

    // 4. Audit log
    try {
      await supabase.from('audit_logs').insert({
        actor_id: userId,
        actor_role: 'citizen',
        action: 'REWARD_REDEEMED',
        entity_name: 'rewards',
        entity_id: reward.id,
        details: {
          rewardTitle: reward.title,
          pointsSpent: reward.points_required,
          claimCode
        }
      });
    } catch (e) {
      console.warn('Audit error:', e);
    }

    return {
      success: true,
      message: `Congratulations! You successfully redeemed: ${reward.title}`,
      claimCode
    };
  }
};
