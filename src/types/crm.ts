
export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Individual {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  companyId: string | null;
  tags: Tag[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  date: string;
  summary: string;
  individualIds: string[];
  companyId: string | null;
  nextSteps: string;
  createdAt: string;
  updatedAt: string;
}

export type StakeholderType = 'individual' | 'company';

export type OptionType = {
  label: string;
  value: string;
};
