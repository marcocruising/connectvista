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

  async createIndividual(individual: Omit<Individual, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    const { data, error } = await supabase
      .from('individuals')
      .insert([individual])
      .select()
      .single();
    
    if (error) throw error;
    return data as Individual;
  },

  async updateIndividual(id: string, individual: Partial<Individual>) {
    const { data, error } = await supabase
      .from('individuals')
      .update(individual)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Individual;
  },

  async deleteIndividual(id: string) {
    const { error } = await supabase
      .from('individuals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}; 