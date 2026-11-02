import { getSupabaseClient } from '../lib/supabase';
import { NotificationItem } from '../types';

export const notificationService = {
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return (data || []).map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        title: n.title,
        message: n.message,
        type: n.type,
        link: n.link,
        isRead: n.is_read || false,
        createdAt: n.created_at
      }));
    } catch (err) {
      console.error('Exception fetching notifications:', err);
      return [];
    }
  },

  async markAsRead(notificationId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
  },

  async markAllAsRead(userId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
  },

  async createNotification(params: {
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'action_required';
    link?: string;
  }) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      await supabase.from('notifications').insert({
        user_id: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        link: params.link || null
      });
    } catch (e) {
      console.warn('Notification insert error:', e);
    }
  }
};
