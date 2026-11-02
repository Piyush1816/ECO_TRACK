import { getSupabaseClient } from '../lib/supabase';
import { AuditLog, UserRole } from '../types';

export const auditService = {
  async getAuditLogs(): Promise<AuditLog[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          actor_id,
          actor_role,
          action,
          entity_name,
          entity_id,
          details,
          created_at,
          profiles:actor_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return (data || []).map((l: any) => ({
        id: l.id,
        actorId: l.actor_id,
        actorName: l.profiles?.full_name || 'System Actor',
        actorRole: (l.actor_role as UserRole) || 'admin',
        action: l.action,
        entityName: l.entity_name,
        entityId: l.entity_id || '',
        details: typeof l.details === 'object' ? JSON.stringify(l.details) : String(l.details || ''),
        timestamp: l.created_at
      }));
    } catch (err) {
      console.error('Exception fetching audit logs:', err);
      return [];
    }
  },

  async logAction(params: {
    actorId: string;
    actorRole: UserRole;
    action: string;
    entityName: string;
    entityId?: string;
    details?: any;
  }) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      await supabase.from('audit_logs').insert({
        actor_id: params.actorId,
        actor_role: params.actorRole,
        action: params.action,
        entity_name: params.entityName,
        entity_id: params.entityId || null,
        details: params.details || {}
      });
    } catch (e) {
      console.warn('Audit logging failed:', e);
    }
  }
};
