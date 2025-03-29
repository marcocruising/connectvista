import { supabase } from '@/lib/supabase';
import { Conversation } from '@/types/crm';

export const conversationService = {
  async getConversations() {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        companies (*),
        conversation_individuals (
          individuals (*)
        ),
        conversation_participants (
          profiles (*)
        ),
        tags (*)
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data as Conversation[];
  },

  async createConversation(
    conversation: Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'created_by'>,
    participantIds: string[],
    individualIds: string[]
  ) {
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .insert([conversation])
      .select()
      .single();
    
    if (convError) throw convError;

    // Add participants
    if (participantIds.length > 0) {
      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert(
          participantIds.map(userId => ({
            conversation_id: convData.id,
            user_id: userId
          }))
        );
      
      if (partError) throw partError;
    }

    // Add individuals
    if (individualIds.length > 0) {
      const { error: indError } = await supabase
        .from('conversation_individuals')
        .insert(
          individualIds.map(individualId => ({
            conversation_id: convData.id,
            individual_id: individualId
          }))
        );
      
      if (indError) throw indError;
    }

    return convData as Conversation;
  },

  async updateConversation(id: string, conversation: Partial<Conversation>) {
    const { data, error } = await supabase
      .from('conversations')
      .update(conversation)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Conversation;
  },

  async deleteConversation(id: string) {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}; 