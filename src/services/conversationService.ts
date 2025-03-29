import { supabase } from '@/lib/supabase';
import { Conversation } from '@/types/crm';

export const conversationService = {
  async getConversations() {
    // Fetch conversations with their associated tag information
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        companies:company_id (*),
        conversation_individuals(individual_id),
        conversation_tags!conversation_id(tag_id),
        tags(*)
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Process the data to include tags correctly
    const conversations = await Promise.all(data.map(async (conversation) => {
      // If conversation already has tags array, use it
      if (conversation.tags) return conversation;
      
      // Otherwise, fetch tags for this conversation
      const { data: tagData, error: tagError } = await supabase
        .from('conversation_tags')
        .select(`
          tags!tag_id(*)
        `)
        .eq('conversation_id', conversation.id);
      
      if (tagError) throw tagError;
      
      // Extract tags from the joined data
      const tags = tagData.map(t => t.tags);
      
      return {
        ...conversation,
        companyId: conversation.company_id,
        individualIds: conversation.conversation_individuals?.map(ci => ci.individual_id) || [],
        nextSteps: conversation.next_steps,
        tags
      };
    }));
    
    return conversations;
  },

  async createConversation(conversationData: Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Extract fields for the conversations table
    const { tags: tagIds, individualIds, companyId, nextSteps, notes, ...rest } = conversationData;
    
    const conversationRecord = {
      ...rest,
      company_id: companyId,
      next_steps: nextSteps,
      notes: notes,
      created_by: user?.id
    };
    
    // Create the conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert([conversationRecord])
      .select()
      .single();
    
    if (error) throw error;
    
    // Associate individuals
    if (individualIds && individualIds.length > 0) {
      const individualAssociations = individualIds.map(id => ({
        conversation_id: data.id,
        individual_id: id
      }));
      
      const { error: individualError } = await supabase
        .from('conversation_individuals')
        .insert(individualAssociations);
      
      if (individualError) throw individualError;
    }
    
    // Associate tags
    if (tagIds && tagIds.length > 0) {
      const tagAssociations = tagIds.map(id => ({
        conversation_id: data.id,
        tag_id: id
      }));
      
      const { error: tagError } = await supabase
        .from('conversation_tags')
        .insert(tagAssociations);
      
      if (tagError) throw tagError;
    }
    
    return {
      ...data,
      companyId: data.company_id,
      nextSteps: data.next_steps,
      individualIds: individualIds || [],
      tags: [] // Will be populated later when fetched
    };
  },

  async updateConversation(id: string, conversationData: Partial<Conversation>) {
    // Extract fields for the main table
    const { tags: tagIds, individualIds, companyId, nextSteps, notes, ...rest } = conversationData;
    
    const conversationRecord = {
      ...rest,
      company_id: companyId,
      next_steps: nextSteps,
      notes: notes,
      updated_at: new Date().toISOString()
    };
    
    // Update conversation main record
    const { data, error } = await supabase
      .from('conversations')
      .update(conversationRecord)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update individual associations
    if (individualIds !== undefined) {
      // First remove existing associations
      const { error: deleteIndividualError } = await supabase
        .from('conversation_individuals')
        .delete()
        .eq('conversation_id', id);
      
      if (deleteIndividualError) throw deleteIndividualError;
      
      // Then add new associations
      if (individualIds.length > 0) {
        const individualAssociations = individualIds.map(individualId => ({
          conversation_id: id,
          individual_id: individualId
        }));
        
        const { error: addIndividualError } = await supabase
          .from('conversation_individuals')
          .insert(individualAssociations);
        
        if (addIndividualError) throw addIndividualError;
      }
    }
    
    // Update tag associations
    if (tagIds !== undefined) {
      // First remove existing associations
      const { error: deleteTagError } = await supabase
        .from('conversation_tags')
        .delete()
        .eq('conversation_id', id);
      
      if (deleteTagError) throw deleteTagError;
      
      // Then add new associations
      if (tagIds.length > 0) {
        const tagAssociations = tagIds.map(tagId => ({
          conversation_id: id,
          tag_id: tagId
        }));
        
        const { error: addTagError } = await supabase
          .from('conversation_tags')
          .insert(tagAssociations);
        
        if (addTagError) throw addTagError;
      }
    }
    
    // Fetch updated tags for return value
    const { data: tagData, error: tagFetchError } = await supabase
      .from('tags')
      .select('*')
      .in('id', tagIds || []);
      
    if (tagFetchError) throw tagFetchError;
    
    return {
      ...data,
      companyId: data.company_id,
      nextSteps: data.next_steps,
      individualIds: individualIds || [],
      tags: tagData || []
    };
  },

  async deleteConversation(id: string) {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}; 