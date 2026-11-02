import { getSupabaseClient } from '../lib/supabase';

export const verificationService = {
  async verifyWeight(params: {
    requestId: string;
    collectionRecordId: string;
    adminId: string;
    verifiedWeightKg: number;
    notes?: string;
  }) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');

    if (params.verifiedWeightKg <= 0) {
      throw new Error('Verified weight must be greater than zero.');
    }

    // 1. Get collection record to compute variance
    const { data: col } = await supabase
      .from('collection_records')
      .select('actual_weight_kg')
      .eq('id', params.collectionRecordId)
      .single();

    const actualWeight = col?.actual_weight_kg ? Number(col.actual_weight_kg) : params.verifiedWeightKg;
    const varianceKg = Number((params.verifiedWeightKg - actualWeight).toFixed(2));
    const status = varianceKg === 0 ? 'approved' : 'adjusted';

    // 2. Insert weight_verification record
    const { data: verification, error: verError } = await supabase
      .from('weight_verifications')
      .insert({
        collection_record_id: params.collectionRecordId,
        admin_id: params.adminId,
        verified_weight_kg: params.verifiedWeightKg,
        variance_kg: varianceKg,
        verification_notes: params.notes || 'Verified against digital weighing slip and scale certificate.',
        status
      })
      .select()
      .single();

    if (verError) throw verError;

    // 3. Update collection_record and pickup_request statuses
    await supabase
      .from('collection_records')
      .update({ status: 'verified' })
      .eq('id', params.collectionRecordId);

    await supabase
      .from('pickup_requests')
      .update({
        status: 'verified',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.requestId);

    // 4. Award Eco-Points to Citizen
    const { data: req } = await supabase
      .from('pickup_requests')
      .select(`
        user_id,
        category_id,
        ewaste_categories:category_id (points_per_kg)
      `)
      .eq('id', params.requestId)
      .single();

    if (req?.user_id) {
      const pointsPerKg = (req.ewaste_categories as any)?.points_per_kg || 10;
      const pointsAwarded = Math.round(params.verifiedWeightKg * pointsPerKg);

      const { data: profile } = await supabase
        .from('profiles')
        .select('reward_points')
        .eq('id', req.user_id)
        .single();

      const currentPoints = profile?.reward_points || 0;

      await supabase
        .from('profiles')
        .update({ reward_points: currentPoints + pointsAwarded })
        .eq('id', req.user_id);

      // Notify citizen
      try {
        await supabase.from('notifications').insert({
          user_id: req.user_id,
          title: 'Weight Verified & Eco-Points Credited!',
          message: `Your e-waste was verified at ${params.verifiedWeightKg} kg. You earned +${pointsAwarded} Eco-Points!`,
          type: 'success',
          link: '/dashboard'
        });
      } catch (e) {
        console.warn('Notif error:', e);
      }
    }

    // 5. Audit log
    try {
      await supabase.from('audit_logs').insert({
        actor_id: params.adminId,
        actor_role: 'admin',
        action: 'WEIGHT_VERIFIED',
        entity_name: 'weight_verifications',
        entity_id: verification.id,
        details: {
          requestId: params.requestId,
          verifiedWeightKg: params.verifiedWeightKg,
          actualWeight,
          varianceKg
        }
      });
    } catch (e) {
      console.warn('Audit error:', e);
    }

    return verification;
  }
};
