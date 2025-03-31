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

/**
 * Look up individuals by email or name
 */
export async function findIndividualByEmailOrName(email: string, name: string) {
  try {
    // First try exact email match (most reliable)
    const { data: emailMatch, error: emailError } = await supabase
      .from('individuals')
      .select('id, company_id, name, email')
      .eq('email', email)
      .maybeSingle();
    
    if (emailError) {
      console.error('Error searching by email:', emailError);
    }
    
    if (emailMatch) {
      return emailMatch;
    }
    
    // If no match by email, try name match
    if (name && name.length > 2) { // Only search if name is meaningful
      const { data: nameMatch, error: nameError } = await supabase
        .from('individuals')
        .select('id, company_id, name, email')
        .ilike('name', `%${name}%`)
        .maybeSingle();
      
      if (nameError) {
        console.error('Error searching by name:', nameError);
      }
      
      if (nameMatch) {
        return nameMatch;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding individual:', error);
    return null;
  }
}

/**
 * Create a new individual from calendar attendee
 */
export async function createIndividualFromAttendee(email: string, name: string) {
  try {
    // Extract domain to guess company
    const domain = email.split('@')[1];
    
    let company_id = null;
    let company_name = null;
    
    // Try to find a company with this domain
    if (domain) {
      const { data: companyMatch } = await supabase
        .from('companies')
        .select('id, name')
        .ilike('website', `%${domain}%`)
        .maybeSingle();
        
      if (companyMatch) {
        company_id = companyMatch.id;
        company_name = companyMatch.name;
      }
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Create the new individual
    const newIndividual = {
      name: name || email.split('@')[0],
      email: email,
      company_id: company_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user?.id
    };
    
    const { data, error } = await supabase
      .from('individuals')
      .insert(newIndividual)
      .select('id, company_id, name, email')  // Return all fields needed
      .single();
      
    if (error) {
      console.error('Error creating individual:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating individual from attendee:', error);
    return null;
  }
} 