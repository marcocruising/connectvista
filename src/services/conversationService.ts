import { supabase } from '@/lib/supabase';
import { Conversation } from '@/types/crm';

export const conversationService = {
  async getConversations() {
    try {
      console.log("Fetching conversations from Supabase");
      
      // Fetch conversations
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          date,
          summary,
          next_steps,
          notes,
          company_id,
          created_at,
          updated_at,
          created_by
        `)
        .order('date', { ascending: false });
      
      if (error) {
        console.error("Error fetching conversations:", error);
        throw error;
      }
      
      // Fetch individual associations for all conversations
      const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_individuals')
        .select('conversation_id, individual_id');
      
      if (participantsError) {
        console.error("Error fetching conversation participants:", participantsError);
        throw participantsError;
      }
      
      // Fetch tag associations for all conversations
      const { data: tagsData, error: tagsError } = await supabase
        .from('conversation_tags')
        .select('conversation_id, tags!tag_id(*)');
      
      if (tagsError) {
        console.error("Error fetching conversation tags:", tagsError);
        throw tagsError;
      }
      
      // Process and combine the data
      const conversations = conversationsData.map(conversation => {
        // Get individual IDs for this conversation
        const individualIds = participantsData
          .filter(p => p.conversation_id === conversation.id)
          .map(p => p.individual_id);
        
        // Get tags for this conversation
        const tags = tagsData
          .filter(t => t.conversation_id === conversation.id)
          .map(t => t.tags);
        
        return {
          ...conversation,
          id: conversation.id,
          title: conversation.title,
          date: conversation.date,
          summary: conversation.summary,
          companyId: conversation.company_id,
          nextSteps: conversation.next_steps,
          notes: conversation.notes,
          individualIds: individualIds,
          tags: tags
        };
      });
      
      console.log("Fetched conversations:", conversations);
      return conversations as Conversation[];
    } catch (error) {
      console.error("Error in getConversations:", error);
      throw error;
    }
  },

  async createConversation(conversationData) {
    try {
      console.log("Creating conversation with data:", conversationData);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Extract fields for conversations table
      const { tags: tagIds, individualIds, companyId, nextSteps, notes, ...rest } = conversationData;
      
      const conversationRecord = {
        ...rest,
        company_id: companyId,
        next_steps: nextSteps,
        notes: notes || null,
        created_by: user?.id
      };
      
      // Create the conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([conversationRecord])
        .select()
        .single();
      
      if (error) {
        console.error("Error creating conversation:", error);
        throw error;
      }
      
      console.log("Created conversation:", data);
      
      // Associate individuals
      if (individualIds && individualIds.length > 0) {
        const individualAssociations = individualIds.map(id => ({
          conversation_id: data.id,
          individual_id: id
        }));
        
        console.log("Creating individual associations:", individualAssociations);
        
        const { error: individualError } = await supabase
          .from('conversation_individuals')
          .insert(individualAssociations);
        
        if (individualError) {
          console.error("Error associating individuals with conversation:", individualError);
          throw individualError;
        }
      }
      
      // Associate tags
      if (tagIds && tagIds.length > 0) {
        const tagAssociations = tagIds.map(id => ({
          conversation_id: data.id,
          tag_id: id
        }));
        
        console.log("Creating tag associations:", tagAssociations);
        
        const { error: tagError } = await supabase
          .from('conversation_tags')
          .insert(tagAssociations);
        
        if (tagError) {
          console.error("Error associating tags with conversation:", tagError);
          throw tagError;
        }
      }
      
      // Return formatted conversation
      return {
        ...data,
        companyId: data.company_id,
        nextSteps: data.next_steps,
        individualIds: individualIds || [],
        tags: [] // Will be populated later when fetched
      };
    } catch (error) {
      console.error("Error in createConversation:", error);
      throw error;
    }
  },

  async updateConversation(id, conversationData) {
    try {
      console.log("Updating conversation:", id, conversationData);
      
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
      
      if (error) {
        console.error("Error updating conversation:", error);
        throw error;
      }
      
      // Update individual associations
      if (individualIds !== undefined) {
        // First remove existing associations
        const { error: deleteIndividualError } = await supabase
          .from('conversation_individuals')
          .delete()
          .eq('conversation_id', id);
        
        if (deleteIndividualError) {
          console.error("Error removing individuals from conversation:", deleteIndividualError);
          throw deleteIndividualError;
        }
        
        // Then add new associations
        if (individualIds.length > 0) {
          const individualAssociations = individualIds.map(individualId => ({
            conversation_id: id,
            individual_id: individualId
          }));
          
          const { error: addIndividualError } = await supabase
            .from('conversation_individuals')
            .insert(individualAssociations);
          
          if (addIndividualError) {
            console.error("Error adding individuals to conversation:", addIndividualError);
            throw addIndividualError;
          }
        }
      }
      
      // Update tag associations
      if (tagIds !== undefined) {
        // First remove existing associations
        const { error: deleteTagError } = await supabase
          .from('conversation_tags')
          .delete()
          .eq('conversation_id', id);
        
        if (deleteTagError) {
          console.error("Error removing tags from conversation:", deleteTagError);
          throw deleteTagError;
        }
        
        // Then add new associations
        if (tagIds.length > 0) {
          const tagAssociations = tagIds.map(tagId => ({
            conversation_id: id,
            tag_id: tagId
          }));
          
          const { error: addTagError } = await supabase
            .from('conversation_tags')
            .insert(tagAssociations);
          
          if (addTagError) {
            console.error("Error adding tags to conversation:", addTagError);
            throw addTagError;
          }
        }
      }
      
      return {
        ...data,
        companyId: data.company_id,
        nextSteps: data.next_steps,
        individualIds: individualIds || [],
        tags: []
      };
    } catch (error) {
      console.error("Error in updateConversation:", error);
      throw error;
    }
  },

  async deleteConversation(id) {
    try {
      console.log("Deleting conversation:", id);
      
      // Delete the conversation (junction tables will cascade)
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting conversation:", error);
        throw error;
      }
      
      console.log("Conversation deleted successfully");
    } catch (error) {
      console.error("Error in deleteConversation:", error);
      throw error;
    }
  }
}; 