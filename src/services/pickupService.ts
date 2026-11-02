import { getSupabaseClient } from '../lib/supabase';
import { PickupRequest } from '../types';

export const pickupService = {
  async getPickups(filters?: { userId?: string; partnerId?: string; status?: string }): Promise<PickupRequest[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      let query = supabase
        .from('pickup_requests')
        .select(`
          id,
          request_number,
          user_id,
          organization_id,
          category_id,
          item_description,
          estimated_quantity,
          estimated_weight_kg,
          pickup_address,
          pickup_city,
          preferred_date,
          time_slot,
          special_notes,
          status,
          created_at,
          updated_at,
          profiles:user_id (full_name, email, phone),
          organizations:organization_id (org_name),
          ewaste_categories:category_id (name, points_per_kg, co2_factor_per_kg),
          pickup_assignments (*),
          collection_records (*),
          weight_verifications (*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching pickups:', error);
        return [];
      }

      return (data || []).map((row: any) => {
        const assignment = Array.isArray(row.pickup_assignments) && row.pickup_assignments.length > 0
          ? row.pickup_assignments[0]
          : null;

        const collectionRecord = Array.isArray(row.collection_records) && row.collection_records.length > 0
          ? row.collection_records[0]
          : null;

        const weightVerification = Array.isArray(row.weight_verifications) && row.weight_verifications.length > 0
          ? row.weight_verifications[0]
          : null;

        return {
          id: row.id,
          requestNumber: row.request_number,
          userId: row.user_id,
          userFullName: row.profiles?.full_name || 'Citizen User',
          userEmail: row.profiles?.email || '',
          userPhone: row.profiles?.phone || '',
          organizationId: row.organization_id,
          organizationName: row.organizations?.org_name,
          categoryId: row.category_id,
          categoryName: row.ewaste_categories?.name || 'Electronic Waste',
          itemDescription: row.item_description,
          estimatedQuantity: row.estimated_quantity,
          estimatedWeightKg: Number(row.estimated_weight_kg),
          pickupAddress: row.pickup_address,
          pickupCity: row.pickup_city,
          preferredDate: row.preferred_date,
          timeSlot: row.time_slot,
          specialNotes: row.special_notes,
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          assignment: assignment ? {
            id: assignment.id,
            requestId: assignment.request_id,
            partnerId: assignment.partner_id,
            partnerCompanyName: assignment.assigned_agent_name || 'Authorized Partner',
            assignedByAdminId: assignment.assigned_by,
            status: assignment.assignment_status,
            rejectionReason: assignment.rejection_reason,
            scheduledAt: assignment.scheduled_at,
            vehicleRegistration: assignment.vehicle_registration,
            assignedAgentName: assignment.assigned_agent_name,
            assignedAt: assignment.assigned_at
          } : undefined,
          collectionRecord: collectionRecord ? {
            id: collectionRecord.id,
            requestId: collectionRecord.request_id,
            collectorId: collectionRecord.collector_id,
            collectorName: collectionRecord.collector_id,
            actualWeightKg: Number(collectionRecord.actual_weight_kg),
            itemCount: collectionRecord.item_count,
            weighingSlipUrl: collectionRecord.weighing_slip_url,
            sealTagNumber: collectionRecord.seal_tag_number,
            gpsCoordinates: collectionRecord.gps_coordinates,
            collectedAt: collectionRecord.collected_at,
            status: collectionRecord.status,
            notes: collectionRecord.notes
          } : undefined,
          weightVerification: weightVerification ? {
            id: weightVerification.id,
            collectionRecordId: weightVerification.collection_record_id,
            adminId: weightVerification.admin_id,
            adminName: 'Compliance Officer',
            verifiedWeightKg: Number(weightVerification.verified_weight_kg),
            varianceKg: Number(weightVerification.variance_kg || 0),
            notes: weightVerification.verification_notes,
            status: weightVerification.status,
            verifiedAt: weightVerification.verified_at
          } : undefined
        };
      });
    } catch (err) {
      console.error('Exception fetching pickups:', err);
      return [];
    }
  },

  async createPickup(params: {
    userId: string;
    organizationId?: string;
    categoryId: string;
    itemDescription: string;
    estimatedQuantity: number;
    estimatedWeightKg: number;
    pickupAddress: string;
    pickupCity: string;
    preferredDate: string;
    timeSlot: string;
    specialNotes?: string;
  }): Promise<PickupRequest> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');

    if (!params.itemDescription || params.estimatedWeightKg <= 0 || params.estimatedQuantity <= 0) {
      throw new Error('Please provide a valid description, quantity and weight.');
    }

    const requestNumber = `REQ-2026-0${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await supabase
      .from('pickup_requests')
      .insert({
        request_number: requestNumber,
        user_id: params.userId,
        organization_id: params.organizationId || null,
        category_id: params.categoryId,
        item_description: params.itemDescription,
        estimated_quantity: params.estimatedQuantity,
        estimated_weight_kg: params.estimatedWeightKg,
        pickup_address: params.pickupAddress,
        pickup_city: params.pickupCity,
        preferred_date: params.preferredDate,
        time_slot: params.timeSlot,
        special_notes: params.specialNotes || null,
        status: 'requested'
      })
      .select(`
        *,
        profiles:user_id (full_name, email, phone),
        ewaste_categories:category_id (name)
      `)
      .single();

    if (error) {
      console.error('Error creating pickup request:', error);
      throw error;
    }

    // Insert audit log
    try {
      await supabase.from('audit_logs').insert({
        actor_id: params.userId,
        actor_role: params.organizationId ? 'organization' : 'citizen',
        action: 'PICKUP_REQUEST_CREATED',
        entity_name: 'pickup_requests',
        entity_id: data.id,
        details: {
          request_number: requestNumber,
          weight_kg: params.estimatedWeightKg,
          category_id: params.categoryId
        }
      });
    } catch (e) {
      console.warn('Audit log write error:', e);
    }

    return {
      id: data.id,
      requestNumber: data.request_number,
      userId: data.user_id,
      userFullName: data.profiles?.full_name || 'Citizen',
      userEmail: data.profiles?.email || '',
      userPhone: data.profiles?.phone || '',
      organizationId: data.organization_id,
      categoryId: data.category_id,
      categoryName: data.ewaste_categories?.name || 'Electronics',
      itemDescription: data.item_description,
      estimatedQuantity: data.estimated_quantity,
      estimatedWeightKg: Number(data.estimated_weight_kg),
      pickupAddress: data.pickup_address,
      pickupCity: data.pickup_city,
      preferredDate: data.preferred_date,
      timeSlot: data.time_slot,
      specialNotes: data.special_notes,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
};
