import { getSupabaseClient } from '../lib/supabase';
import { EWasteBatch } from '../types';

export const batchService = {
  async getBatches(): Promise<EWasteBatch[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('ewaste_batches')
        .select(`
          id,
          batch_number,
          recycler_id,
          created_by,
          total_weight_kg,
          item_count,
          manifest_number,
          hazardous_waste_pass_number,
          status,
          dispatched_at,
          received_at,
          completed_at,
          profiles:recycler_id (full_name),
          recycler_details:recycler_id (facility_name),
          recycling_records (*)
        `)
        .order('dispatched_at', { ascending: false });

      if (error) {
        console.error('Error fetching batches:', error);
        return [];
      }

      return (data || []).map((row: any) => {
        const recyclingRecord = Array.isArray(row.recycling_records) && row.recycling_records.length > 0
          ? row.recycling_records[0]
          : null;

        const facilityName = (row.recycler_details as any)?.facility_name || 
                             (row.profiles as any)?.full_name || 
                             'Certified Recycler';

        return {
          id: row.id,
          batchNumber: row.batch_number,
          recyclerId: row.recycler_id,
          recyclerFacilityName: facilityName,
          createdById: row.created_by,
          pickupRequestIds: [], // mapped in service or relation
          totalWeightKg: Number(row.total_weight_kg),
          itemCount: row.item_count,
          manifestNumber: row.manifest_number,
          status: row.status,
          dispatchedAt: row.dispatched_at,
          receivedAt: row.received_at,
          completedAt: row.completed_at,
          recyclingRecord: recyclingRecord ? {
            id: recyclingRecord.id,
            batchId: recyclingRecord.batch_id,
            batchNumber: row.batch_number,
            recyclerId: recyclingRecord.recycler_id,
            facilityName,
            receivedWeightKg: Number(recyclingRecord.received_weight_kg),
            copperRecoveredKg: Number(recyclingRecord.copper_recovered_kg || 0),
            aluminumRecoveredKg: Number(recyclingRecord.aluminum_recovered_kg || 0),
            plasticsRecoveredKg: Number(recyclingRecord.plastics_recovered_kg || 0),
            preciousMetalsGrams: Number(recyclingRecord.precious_metals_grams || 0),
            glassRecoveredKg: Number(recyclingRecord.glass_recovered_kg || 0),
            hazardousResidueKg: Number(recyclingRecord.hazardous_residue_kg || 0),
            processingMethod: recyclingRecord.processing_method,
            certificateNumber: recyclingRecord.certificate_url || `CERT-REC-2026-${row.batch_number.split('-')[2] || '001'}`,
            adminVerified: recyclingRecord.admin_verified || false,
            submittedAt: recyclingRecord.submitted_at,
            verifiedAt: recyclingRecord.verified_at
          } : undefined
        };
      });
    } catch (err) {
      console.error('Exception fetching batches:', err);
      return [];
    }
  },

  async createBatch(params: {
    recyclerId: string;
    requestIds: string[];
    manifestNumber: string;
    adminId: string;
  }): Promise<EWasteBatch> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');

    if (params.requestIds.length === 0) {
      throw new Error('At least one verified pickup request must be selected.');
    }

    // 1. Fetch total verified weights and items for selected requests
    const { data: requests, error: reqError } = await supabase
      .from('pickup_requests')
      .select(`
        id,
        estimated_weight_kg,
        estimated_quantity,
        weight_verifications (verified_weight_kg),
        collection_records (actual_weight_kg, item_count)
      `)
      .in('id', params.requestIds);

    if (reqError || !requests) throw new Error('Failed to load selected pickup requests.');

    let totalWeight = 0;
    let totalItems = 0;

    requests.forEach((r: any) => {
      const verWeight = r.weight_verifications?.[0]?.verified_weight_kg;
      const colWeight = r.collection_records?.[0]?.actual_weight_kg;
      const weight = verWeight ? Number(verWeight) : (colWeight ? Number(colWeight) : Number(r.estimated_weight_kg));
      const items = r.collection_records?.[0]?.item_count ? Number(r.collection_records[0].item_count) : Number(r.estimated_quantity);
      totalWeight += weight;
      totalItems += items;
    });

    const batchNumber = `BATCH-2026-00${Math.floor(40 + Math.random() * 60)}`;

    // 2. Insert into ewaste_batches
    const { data: batch, error: batchError } = await supabase
      .from('ewaste_batches')
      .insert({
        batch_number: batchNumber,
        recycler_id: params.recyclerId,
        created_by: params.adminId,
        total_weight_kg: Number(totalWeight.toFixed(2)),
        item_count: totalItems,
        manifest_number: params.manifestNumber,
        status: 'dispatched'
      })
      .select(`
        *,
        profiles:recycler_id (full_name)
      `)
      .single();

    if (batchError) throw batchError;

    // 3. Update pickup_requests status to 'batch_assigned'
    await supabase
      .from('pickup_requests')
      .update({
        status: 'batch_assigned',
        updated_at: new Date().toISOString()
      })
      .in('id', params.requestIds);

    // 4. Notify Recycler
    try {
      await supabase.from('notifications').insert({
        user_id: params.recyclerId,
        title: 'Inbound E-Waste Batch Dispatched',
        message: `Batch ${batchNumber} (${totalWeight.toFixed(1)} kg) dispatched to your facility. Manifest: ${params.manifestNumber}.`,
        type: 'action_required',
        link: '/dashboard'
      });
    } catch (e) {
      console.warn('Notif error:', e);
    }

    // 5. Audit log
    try {
      await supabase.from('audit_logs').insert({
        actor_id: params.adminId,
        actor_role: 'admin',
        action: 'BATCH_DISPATCHED',
        entity_name: 'ewaste_batches',
        entity_id: batch.id,
        details: {
          batchNumber,
          recyclerId: params.recyclerId,
          totalWeightKg: totalWeight,
          itemCount: totalItems,
          requestCount: params.requestIds.length
        }
      });
    } catch (e) {
      console.warn('Audit error:', e);
    }

    return {
      id: batch.id,
      batchNumber: batch.batch_number,
      recyclerId: batch.recycler_id,
      recyclerFacilityName: batch.profiles?.full_name || 'Certified Recycler',
      createdById: batch.created_by,
      pickupRequestIds: params.requestIds,
      totalWeightKg: Number(batch.total_weight_kg),
      itemCount: batch.item_count,
      manifestNumber: batch.manifest_number,
      status: batch.status,
      dispatchedAt: batch.dispatched_at
    };
  },

  async confirmBatchReceipt(batchId: string, recyclerId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');

    const { error } = await supabase
      .from('ewaste_batches')
      .update({
        status: 'received',
        received_at: new Date().toISOString()
      })
      .eq('id', batchId);

    if (error) throw error;

    try {
      await supabase.from('audit_logs').insert({
        actor_id: recyclerId,
        actor_role: 'recycler',
        action: 'BATCH_RECEIVED',
        entity_name: 'ewaste_batches',
        entity_id: batchId,
        details: { receivedAt: new Date().toISOString() }
      });
    } catch (e) {
      console.warn('Audit error:', e);
    }
  }
};
