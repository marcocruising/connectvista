import { supabase } from '@/lib/supabase';
import { Tag } from '@/types/crm';

export const tagService = {
  async getTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as Tag[];
  },

  async createTag(tag: Omit<Tag, 'id' | 'created_at' | 'created_by'>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('tags')
      .insert([{ ...tag, created_by: user?.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Tag;
  },

  async updateTag(id: string, tag: Partial<Tag>) {
    const { data, error } = await supabase
      .from('tags')
      .update(tag)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Tag;
  },

  async deleteTag(id: string) {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}; 