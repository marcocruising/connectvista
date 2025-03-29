import { supabase } from '@/lib/supabase';
import { Company, CompanyTag } from '@/types/crm';

export const companyService = {
  async getCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        tags (*)
      `)
      .order('name');
    
    if (error) throw error;
    return data as Company[];
  },

  async createCompany(company: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    const { data, error } = await supabase
      .from('companies')
      .insert([company])
      .select()
      .single();
    
    if (error) throw error;
    return data as Company;
  },

  async updateCompany(id: string, company: Partial<Company>) {
    const { data, error } = await supabase
      .from('companies')
      .update(company)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Company;
  },

  async deleteCompany(id: string) {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async addCompanyTag(companyId: string, tagId: string) {
    const { error } = await supabase
      .from('company_tags')
      .insert([{ company_id: companyId, tag_id: tagId }]);
    
    if (error) throw error;
  },

  async removeCompanyTag(companyId: string, tagId: string) {
    const { error } = await supabase
      .from('company_tags')
      .delete()
      .eq('company_id', companyId)
      .eq('tag_id', tagId);
    
    if (error) throw error;
  },

  async updateCompanyTags(companyId: string, tagIds: string[]) {
    try {
      // First, remove all existing tags for this company
      const { error: deleteError } = await supabase
        .from('company_tags')
        .delete()
        .eq('company_id', companyId);
      
      if (deleteError) throw deleteError;
      
      // Then add new tag associations
      if (tagIds.length > 0) {
        const tagRows = tagIds.map(tagId => ({
          company_id: companyId,
          tag_id: tagId
        }));
        
        const { error: insertError } = await supabase
          .from('company_tags')
          .insert(tagRows);
        
        if (insertError) throw insertError;
      }
      
      // Finally, get the updated company with its tags
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          tags (*)
        `)
        .eq('id', companyId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating company tags:', error);
      throw error;
    }
  },
  
  async getCompany(id: string) {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        tags (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Company;
  }
}; 