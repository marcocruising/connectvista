export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          website?: string;
          industry?: string;
          size?: 'Small' | 'Medium' | 'Large' | 'Enterprise';
          type?: 'Investor' | 'Customer' | 'Partner' | 'Vendor' | 'Other';
          description?: string;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['companies']['Insert']>;
      };
      individuals: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email?: string;
          phone?: string;
          company_id?: string;
          role?: string;
          contact_type?: 'Investor' | 'Customer' | 'Potential Employee' | 'Partner' | 'Other';
          description?: string;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: Omit<Database['public']['Tables']['individuals']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['individuals']['Insert']>;
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string;
          category: 'Company' | 'Individual' | 'Conversation' | 'All';
          created_at: string;
          created_by: string;
        };
        Insert: Omit<Database['public']['Tables']['tags']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tags']['Insert']>;
      };
      // ... add other tables as needed
    };
  };
}; 