
import { create } from 'zustand';
import { companies, conversations, individuals, tags } from '@/data/mockData';
import { Company, Conversation, Individual, Tag } from '@/types/crm';

interface CRMState {
  companies: Company[];
  individuals: Individual[];
  conversations: Conversation[];
  tags: Tag[];
  searchQuery: string;
  selectedTags: string[];
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tagIds: string[]) => void;
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCompany: (id: string, companyData: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  addIndividual: (individual: Omit<Individual, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIndividual: (id: string, individualData: Partial<Individual>) => void;
  deleteIndividual: (id: string) => void;
  addConversation: (conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateConversation: (id: string, conversationData: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  addTag: (tag: Omit<Tag, 'id'>) => void;
  updateTag: (id: string, tagData: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
}

export const useCRMStore = create<CRMState>((set) => ({
  companies,
  individuals,
  conversations,
  tags,
  searchQuery: '',
  selectedTags: [],
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTags: (tagIds) => set({ selectedTags: tagIds }),
  
  addCompany: (company) => set((state) => {
    const newCompany: Company = {
      ...company,
      id: `company-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { companies: [...state.companies, newCompany] };
  }),
  
  updateCompany: (id, companyData) => set((state) => ({
    companies: state.companies.map((company) =>
      company.id === id
        ? { ...company, ...companyData, updatedAt: new Date().toISOString() }
        : company
    ),
  })),
  
  deleteCompany: (id) => set((state) => ({
    companies: state.companies.filter((company) => company.id !== id),
  })),
  
  addIndividual: (individual) => set((state) => {
    const newIndividual: Individual = {
      ...individual,
      id: `individual-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { individuals: [...state.individuals, newIndividual] };
  }),
  
  updateIndividual: (id, individualData) => set((state) => ({
    individuals: state.individuals.map((individual) =>
      individual.id === id
        ? { ...individual, ...individualData, updatedAt: new Date().toISOString() }
        : individual
    ),
  })),
  
  deleteIndividual: (id) => set((state) => ({
    individuals: state.individuals.filter((individual) => individual.id !== id),
  })),
  
  addConversation: (conversation) => set((state) => {
    const newConversation: Conversation = {
      ...conversation,
      id: `conversation-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { conversations: [...state.conversations, newConversation] };
  }),
  
  updateConversation: (id, conversationData) => set((state) => ({
    conversations: state.conversations.map((conversation) =>
      conversation.id === id
        ? { ...conversation, ...conversationData, updatedAt: new Date().toISOString() }
        : conversation
    ),
  })),
  
  deleteConversation: (id) => set((state) => ({
    conversations: state.conversations.filter((conversation) => conversation.id !== id),
  })),
  
  addTag: (tag) => set((state) => {
    const newTag: Tag = {
      ...tag,
      id: `tag-${Date.now()}`,
    };
    return { tags: [...state.tags, newTag] };
  }),
  
  updateTag: (id, tagData) => set((state) => ({
    tags: state.tags.map((tag) =>
      tag.id === id
        ? { ...tag, ...tagData }
        : tag
    ),
  })),
  
  deleteTag: (id) => set((state) => ({
    tags: state.tags.filter((tag) => tag.id !== id),
    individuals: state.individuals.map(individual => ({
      ...individual,
      tags: individual.tags.filter(tag => tag.id !== id)
    }))
  })),
}));

// Utility functions to filter data based on search query and tags
export const useFilteredIndividuals = () => {
  const { individuals, searchQuery, selectedTags } = useCRMStore();
  
  return individuals.filter((individual) => {
    const matchesSearch =
      searchQuery === '' ||
      individual.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      individual.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      individual.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      individual.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      individual.notes.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags =
      selectedTags.length === 0 ||
      individual.tags.some((tag) => selectedTags.includes(tag.id));
    
    return matchesSearch && matchesTags;
  });
};

export const useFilteredCompanies = () => {
  const { companies, searchQuery } = useCRMStore();
  
  return companies.filter((company) =>
    searchQuery === '' ||
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

export const useFilteredConversations = () => {
  const { conversations, searchQuery, selectedTags, individuals } = useCRMStore();
  
  return conversations.filter((conversation) => {
    const matchesSearch =
      searchQuery === '' ||
      conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.nextSteps.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedTags.length === 0) {
      return matchesSearch;
    }
    
    // Check if any individual in the conversation has the selected tags
    const conversationIndividuals = individuals.filter((individual) =>
      conversation.individualIds.includes(individual.id)
    );
    
    const hasTags = conversationIndividuals.some((individual) =>
      individual.tags.some((tag) => selectedTags.includes(tag.id))
    );
    
    return matchesSearch && hasTags;
  });
};
