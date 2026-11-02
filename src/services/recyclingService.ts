import { getSupabaseClient } from '../lib/supabase';

export const recyclingService = {
  async submitRecyclingRecord(params: {
    batchId: string;
    recyclerId: string;
    receivedWeightKg: number;
    copperRecoveredKg: number;
    aluminumRecoveredKg: number;
    plasticsRecoveredKg: number;
    preciousMetalsGrams: number;
    glassRecoveredKg: number;
    hazardousResidueKg: number;
    processingMethod: string;
  }) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');

    if (params.receivedWeightKg <= 0) {
      throw new Error('Received weight must be greater than zero.');
    }

    const totalRecoveredKg = 
      params.copperRecoveredKg + 
      params.aluminumRecoveredKg + 
      params.plasticsRecoveredKg + 
      params.glassRecoveredKg + 
      params.hazardousResidueKg;

    if (totalRecoveredKg > params.receivedWeightKg * 1.05) {
      throw new Error('Sum of recovered fractions cannot exceed inbound received gross mass by more than 5%.');
    }

    const certificateNumber = `CERT-REC-2026-00${Math.floor(10 + Math.random() * 90)}`;

    // 1. Insert into recycling_records
    const { data: record, error: recError } = await supabase
      .from('recycling_records')
      .insert({
        batch_id: params.batchId,
        recycler_id: params.recyclerId,
        received_weight_kg: params.receivedWeightKg,
        copper_recovered_kg: params.copperRecoveredKg,
        aluminum_recovered_kg: params.aluminumRecoveredKg,
        plastics_recovered_kg: params.plasticsRecoveredKg,
        precious_metals_grams: params.preciousMetalsGrams,
        glass_recovered_kg: params.glassRecoveredKg,
        hazardous_residue_kg: params.hazardousResidueKg,
        processing_method: params.processingMethod,
        certificate_url: certificateNumber,
        admin_verified: false,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (recError) throw recError;

    // 2. Update ewaste_batch status to 'completed'
    await supabase
      .from('ewaste_batches')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', params.batchId);

    // 3. Notify Admin compliance officers
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (admins && admins.length > 0) {
      const notifs = admins.map(admin => ({
        user_id: admin.id,
        title: 'Recycling Manifest Ready for Verification',
        message: `Recycler submitted recovery yield for Batch #${params.batchId}. Eligible for EPR compliance credit review.`,
        type: 'action_required',
        link: '/dashboard'
      }));
      try {
        await supabase.from('notifications').insert(notifs);
      } catch (e) {
        console.warn('Notif error:', e);
      }
    }

    // 4. Audit log
    try {
      await supabase.from('audit_logs').insert({
        actor_id: params.recyclerId,
        actor_role: 'recycler',
        action: 'RECYCLING_RECORD_SUBMITTED',
        entity_name: 'recycling_records',
        entity_id: record.id,
        details: {
          batchId: params.batchId,
          receivedWeightKg: params.receivedWeightKg,
          copperKg: params.copperRecoveredKg,
          aluminumKg: params.aluminumRecoveredKg,
          plasticsKg: params.plasticsRecoveredKg,
          preciousMetalsGrams: params.preciousMetalsGrams
        }
      });
    } catch (e) {
      console.warn('Audit error:', e);
    }

    return record;
  }
};
