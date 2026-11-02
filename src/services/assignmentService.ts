import { getSupabaseClient } from '../lib/supabase';

export const assignmentService = {
  async assignPartner(requestId: string, partnerId: string, adminId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');

    // 1. Insert into pickup_assignments
    const { data: assignment, error: assignError } = await supabase
      .from('pickup_assignments')
      .insert({
        request_id: requestId,
        partner_id: partnerId,
        assigned_by: adminId,
        assignment_status: 'assigned',
        assigned_at: new Date().toISOString()
      })
      .select()
      .single();

    if (assignError) throw assignError;

    // 2. Update pickup_requests status to 'assigned'
    const { error: updateError } = await supabase
      .from('pickup_requests')
      .update({
        status: 'assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // 3. Send notification to partner
    try {
      await supabase.from('notifications').insert({
        user_id: partnerId,
        title: 'New Pickup Assigned',
        message: 'Admin has dispatched an e-waste collection request to your fleet.',
        type: 'action_required',
        link: '/dashboard'
      });
    } catch (e) {
      console.warn('Notification error:', e);
    }

    // 4. Audit log
    try {
      await supabase.from('audit_logs').insert({
        actor_id: adminId,
        actor_role: 'admin',
        action: 'PARTNER_ASSIGNED',
        entity_name: 'pickup_assignments',
        entity_id: assignment.id,
        details: { requestId, partnerId }
      });
    } catch (e) {
      console.warn('Audit error:', e);
    }

    return assignment;
  },

  async respondToAssignment(assignmentId: string, requestId: string, partnerId: string, accepted: boolean, rejectionReason?: string) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');

    if (!accepted) {
      // Mark assignment rejected and revert pickup_request to 'requested'
      await supabase
        .from('pickup_assignments')
        .update({
          assignment_status: 'rejected',
          rejection_reason: rejectionReason || 'Partner declined assignment',
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      await supabase
        .from('pickup_requests')
        .update({
          status: 'requested',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);
    } else {
      await supabase
        .from('pickup_assignments')
        .update({
          assignment_status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId);
    }

    try {
      await supabase.from('audit_logs').insert({
        actor_id: partnerId,
        actor_role: 'partner',
        action: accepted ? 'ASSIGNMENT_ACCEPTED' : 'ASSIGNMENT_REJECTED',
        entity_name: 'pickup_assignments',
        entity_id: assignmentId,
        details: { accepted, rejectionReason }
      });
    } catch (e) {
      console.warn('Audit error:', e);
    }
  },

  async schedulePickup(params: {
    assignmentId: string;
    requestId: string;
    partnerId: string;
    scheduledAt: string;
    assignedAgentName: string;
    vehicleRegistration: string;
  }) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');

    // 1. Update assignment
    const { error: assignError } = await supabase
      .from('pickup_assignments')
      .update({
        scheduled_at: params.scheduledAt,
        assigned_agent_name: params.assignedAgentName,
        vehicle_registration: params.vehicleRegistration,
        assignment_status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.assignmentId);

    if (assignError) throw assignError;

    // 2. Update pickup_request status
    const { error: reqError } = await supabase
      .from('pickup_requests')
      .update({
        status: 'scheduled',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.requestId);

    if (reqError) throw reqError;

    // 3. Notify citizen
    const { data: req } = await supabase
      .from('pickup_requests')
      .select('user_id, request_number')
      .eq('id', params.requestId)
      .single();

    if (req?.user_id) {
      try {
        await supabase.from('notifications').insert({
          user_id: req.user_id,
          title: 'Pickup Scheduled',
          message: `Your pickup #${req.request_number} is scheduled for ${new Date(params.scheduledAt).toLocaleString()} by ${params.assignedAgentName} (${params.vehicleRegistration}).`,
          type: 'info'
        });
      } catch (e) {
        console.warn('Notif error:', e);
      }
    }

    try {
      await supabase.from('audit_logs').insert({
        actor_id: params.partnerId,
        actor_role: 'partner',
        action: 'PICKUP_SCHEDULED',
        entity_name: 'pickup_assignments',
        entity_id: params.assignmentId,
        details: params
      });
    } catch (e) {
      console.warn('Audit error:', e);
    }
  }
};
