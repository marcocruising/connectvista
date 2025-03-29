export interface Tag {
  id: string;
  name: string;
  color: string;
  category: 'Company' | 'Individual' | 'Conversation' | 'All';
  created_at: string;
  created_by: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  type?: 'Investor' | 'Customer' | 'Partner' | 'Vendor' | 'Other';
  description?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  tags?: Tag[];
  company_id?: string | null;
}

export interface Individual {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company_id?: string;
  role?: string;
  contact_type?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  tags?: Tag[];
}

export interface Conversation {
  id: string;
  title: string;
  date: string;
  summary: string;
  nextSteps?: string;
  notes?: string;
  companyId?: string;
  individualIds: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
  tags?: Tag[];
}

// Helper types
export interface CompanyTag {
  company_id: string;
  tag_id: string;
}

export interface IndividualTag {
  individual_id: string;
  tag_id: string;
}

export interface ConversationTag {
  conversation_id: string;
  tag_id: string;
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
}

export interface ConversationIndividual {
  conversation_id: string;
  individual_id: string;
}

export interface Profile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export type StakeholderType = 'individual' | 'company';

export type OptionType = {
  label: string;
  value: string;
};
