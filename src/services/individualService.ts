import { supabase } from '@/lib/supabase';
import { Individual } from '@/types/crm';

export const individualService = {
  async getIndividuals() {
    const { data, error } = await supabase
      .from('individuals')
      .select(`
        *,
        companies (*),
        tags (*)
      `)
      .order('last_name');
    
    if (error) throw error;
    return data as Individual[];
  },

  async createIndividual(individualData: Omit<Individual, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Extract tags from the data (if present)
      const { tags, ...individual } = individualData as any;
      
      // Log what we're sending to Supabase
      console.log('Creating individual with data:', { ...individual, created_by: user?.id });
      
      // Insert the individual without tags
      const { data, error } = await supabase
        .from('individuals')
        .insert([{ ...individual, created_by: user?.id }])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Individual created:', data);
      
      // If tags were provided, add them
      if (tags && tags.length > 0) {
        try {
          await this.updateIndividualTags(data.id, tags);
          console.log('Tags added to individual');
        } catch (tagError) {
          console.error('Error adding tags:', tagError);
          throw tagError;
        }
      }
      
      return data as Individual;
    } catch (error) {
      console.error('Error in createIndividual:', error);
      throw error;
    }
  },

  async updateIndividual(id: string, individualData: Partial<Individual>) {
    // Extract tags from the data (if present)
    const { tags, ...individual } = individualData as any;
    
    // Update the individual without tags
    const { data, error } = await supabase
      .from('individuals')
      .update(individual)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // If tags were provided, update them
    if (tags) {
      await this.updateIndividualTags(id, tags);
    }
    
    return data as Individual;
  },

  async deleteIndividual(id: string) {
    // First, delete any tag associations
    await this.clearIndividualTags(id);
    
    // Then delete the individual
    const { error } = await supabase
      .from('individuals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
  
  // Tag management methods
  async updateIndividualTags(individualId: string, tagIds: string[]) {
    // First, remove existing tag associations
    await this.clearIndividualTags(individualId);
    
    // Then add new ones if there are any
    if (tagIds.length > 0) {
      const tagInserts = tagIds.map(tagId => ({
        individual_id: individualId,
        tag_id: tagId
      }));
      
      const { error } = await supabase
        .from('individual_tags')
        .insert(tagInserts);
      
      if (error) throw error;
    }
  },
  
  async clearIndividualTags(individualId: string) {
    const { error } = await supabase
      .from('individual_tags')
      .delete()
      .eq('individual_id', individualId);
    
    if (error) throw error;
  }
}; 