import { getSupabaseClient } from '../lib/supabase';

export const collectionService = {
  async submitCollectionRecord(params: {
    requestId: string;
    collectorId: string;
    actualWeightKg: number;
    itemCount: number;
    sealTagNumber: string;
    weighingSlipUrl?: string;
    notes?: string;
    gpsCoordinates?: string;
  }) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');

    if (params.actualWeightKg <= 0 || params.itemCount <= 0 || !params.sealTagNumber) {
      throw new Error('Please specify positive weight, item count, and tamper seal number.');
    }

    // 1. Insert collection_record
    const { data: record, error: colError } = await supabase
      .from('collection_records')
      .insert({
        request_id: params.requestId,
        collector_id: params.collectorId,
        actual_weight_kg: params.actualWeightKg,
        item_count: params.itemCount,
        seal_tag_number: params.sealTagNumber,
        weighing_slip_url: params.weighingSlipUrl || null,
        notes: params.notes || null,
        gps_coordinates: params.gpsCoordinates || '40.7128° N, 74.0060° W',
        status: 'submitted'
      })
      .select()
      .single();

    if (colError) throw colError;

    // 2. Update pickup_request status to 'collected'
    const { error: reqError } = await supabase
      .from('pickup_requests')
      .update({
        status: 'collected',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.requestId);

    if (reqError) throw reqError;

    // 3. Notify Admin users for QA weight verification
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (admins && admins.length > 0) {
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        title: 'Collection Record Submitted',
        message: `Collector logged actual weight ${params.actualWeightKg} kg (Seal #${params.sealTagNumber}). Pending Admin QA cross-check.`,
        type: 'action_required',
        link: '/dashboard'
      }));
      try {
        await supabase.from('notifications').insert(notifications);
      } catch (e) {
        console.warn('Notif error:', e);
      }
    }

    // 4. Audit log
    try {
      await supabase.from('audit_logs').insert({
        actor_id: params.collectorId,
        actor_role: 'partner',
        action: 'COLLECTION_RECORD_SUBMITTED',
        entity_name: 'collection_records',
        entity_id: record.id,
        details: {
          requestId: params.requestId,
          actualWeightKg: params.actualWeightKg,
          sealTagNumber: params.sealTagNumber
        }
      });
    } catch (e) {
      console.warn('Audit error:', e);
    }

    return record;
  }
};
