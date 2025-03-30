import { supabase } from '@/lib/supabase';
import { Reminder } from '@/types/crm';

export const reminderService = {
  async getReminders() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('reminders')
      .select(`
        *,
        conversations:conversation_id (
          id,
          title
        )
      `)
      .eq('created_by', user?.id)
      .order('due_date', { ascending: true });
      
    if (error) {
      console.error("Error fetching reminders:", error);
      throw error;
    }
    
    return data || [];
  },
  
  async getUpcomingReminders() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('reminders')
      .select(`
        *,
        conversations:conversation_id (
          id,
          title
        )
      `)
      .eq('created_by', user?.id)
      .eq('status', 'pending')
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
      .limit(10);
      
    if (error) {
      console.error("Error fetching upcoming reminders:", error);
      throw error;
    }
    
    return data || [];
  },
  
  async getRemindersByConversation(conversationId: string) {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('due_date', { ascending: true });
      
    if (error) {
      console.error("Error fetching conversation reminders:", error);
      throw error;
    }
    
    return data || [];
  },
  
  async createReminder(reminderData: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('reminders')
      .insert([{
        ...reminderData,
        created_by: user?.id
      }])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating reminder:", error);
      throw error;
    }
    
    return data;
  },
  
  async updateReminder(id: string, reminderData: Partial<Reminder>) {
    const { data, error } = await supabase
      .from('reminders')
      .update({
        ...reminderData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating reminder:", error);
      throw error;
    }
    
    return data;
  },
  
  async deleteReminder(id: string) {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting reminder:", error);
      throw error;
    }
    
    return true;
  },
  
  async markReminderAsComplete(id: string) {
    return this.updateReminder(id, { status: 'completed' });
  },
  
  async dismissReminder(id: string) {
    return this.updateReminder(id, { status: 'dismissed' });
  }
}; 