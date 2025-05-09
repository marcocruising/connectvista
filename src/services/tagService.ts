import { supabase } from '@/lib/supabase';
import { Tag } from '@/types/crm';

export const tagService = {
  async getTags(bucketId: string) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('bucket_id', bucketId)
      .order('name');
    
    if (error) throw error;
    return data as Tag[];
  },

  async createTag(tag: Omit<Tag, 'id' | 'created_at' | 'created_by' | 'bucket_id'>, bucketId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('tags')
      .insert([{ ...tag, created_by: user?.id, bucket_id: bucketId }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Tag;
  },

  async updateTag(id: string, tag: Partial<Tag>, bucketId: string) {
    const { data, error } = await supabase
      .from('tags')
      .update(tag)
      .eq('id', id)
      .eq('bucket_id', bucketId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Tag;
  },

  async deleteTag(id: string, bucketId: string) {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)
      .eq('bucket_id', bucketId);
    
    if (error) throw error;
  }
}; 