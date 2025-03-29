import { create } from 'zustand';
import { Tag, Company, Individual, Conversation } from '@/types/crm';
import { tagService } from '@/services/tagService';
import { companyService } from '@/services/companyService';
import { individualService } from '@/services/individualService';
import { conversationService } from '@/services/conversationService';
import { authService } from '@/services/authService';

interface CRMState {
  // Data
  companies: Company[];
  individuals: Individual[];
  conversations: Conversation[];
  tags: Tag[];
  
  // UI state
  searchQuery: string;
  selectedTags: string[];
  isLoading: boolean;
  error: string | null;
  
  // Auth state
  user: any | null;
  isAuthenticated: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tagIds: string[]) => void;
  clearError: () => void;
  
  // Data fetching
  fetchTags: () => Promise<void>;
  fetchCompanies: () => Promise<void>;
  fetchIndividuals: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  
  // CRUD operations
  addTag: (tag: Omit<Tag, 'id' | 'created_at' | 'created_by'>) => Promise<void>;
  updateTag: (id: string, tag: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  
  addCompany: (company: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => Promise<void>;
  updateCompany: (id: string, company: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  
  addIndividual: (individual: Omit<Individual, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => Promise<void>;
  updateIndividual: (id: string, individual: Partial<Individual>) => Promise<void>;
  deleteIndividual: (id: string) => Promise<void>;
  
  addConversation: (conversation: Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'created_by'>, tags: string[], individualIds: string[]) => Promise<Conversation>;
  updateConversation: (id: string, conversation: Partial<Conversation>) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  
  // Auth actions
  initializeAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // New functions
  updateIndividualWithTags: (individualId: string, tagIds: string[]) => Promise<void>;
  updateCompanyWithTags: (id: string, tagIds: string[]) => Promise<void>;
}

export const useCRMStore = create<CRMState>((set, get) => ({
  // Initial state
  companies: [],
  individuals: [],
  conversations: [],
  tags: [],
  searchQuery: '',
  selectedTags: [],
  isLoading: false,
  error: null,

  // Auth state
  user: null,
  isAuthenticated: false,

  // UI actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTags: (tagIds) => set({ selectedTags: tagIds }),
  clearError: () => set({ error: null }),

  // Data fetching
  fetchTags: async () => {
    try {
      set({ isLoading: true });
      const tags = await tagService.getTags();
      set({ tags, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchCompanies: async () => {
    try {
      set({ isLoading: true });
      const companies = await companyService.getCompanies();
      set({ companies, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchIndividuals: async () => {
    try {
      set({ isLoading: true });
      const individuals = await individualService.getIndividuals();
      set({ individuals, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchConversations: async () => {
    try {
      set({ isLoading: true });
      const conversations = await conversationService.getConversations();
      set({ conversations, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // CRUD operations
  addTag: async (tag) => {
    try {
      set({ isLoading: true });
      const newTag = await tagService.createTag(tag);
      set(state => ({
        tags: [...state.tags, newTag],
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateTag: async (id, tag) => {
    try {
      set({ isLoading: true });
      const updatedTag = await tagService.updateTag(id, tag);
      set(state => ({
        tags: state.tags.map(t => t.id === id ? updatedTag : t),
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteTag: async (id) => {
    try {
      set({ isLoading: true });
      await tagService.deleteTag(id);
      set(state => ({
        tags: state.tags.filter(t => t.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Companies
  addCompany: async (company) => {
    try {
      set({ isLoading: true });
      const newCompany = await companyService.createCompany(company);
      set(state => ({ 
        companies: [...state.companies, newCompany], 
        isLoading: false 
      }));
      return newCompany; // Return the new company for tag handling
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error; // Re-throw to allow handling in the form
    }
  },

  updateCompany: async (id, companyData) => {
    try {
      set({ isLoading: true });
      const updatedCompany = await companyService.updateCompany(id, companyData);
      set(state => ({
        companies: state.companies.map(company => 
          company.id === id ? updatedCompany : company
        ),
        isLoading: false
      }));
      return updatedCompany; // Return the updated company for tag handling
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error; // Re-throw to allow handling in the form
    }
  },

  deleteCompany: async (id) => {
    try {
      set({ isLoading: true });
      await companyService.deleteCompany(id);
      set(state => ({
        companies: state.companies.filter(company => company.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Individuals
  addIndividual: async (individual) => {
    try {
      set({ isLoading: true });
      // Extract tags to handle them separately
      const { tags, ...individualData } = individual as any;
      
      const newIndividual = await individualService.createIndividual(individualData);
      
      // Add the new individual to state without tags initially
      set(state => ({
        individuals: [...state.individuals, newIndividual],
        isLoading: false
      }));
      
      return newIndividual; // Return the new individual for tag handling
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateIndividual: async (id, individualData) => {
    try {
      set({ isLoading: true });
      // Extract tags to handle them separately
      const { tags, ...individual } = individualData as any;
      
      const updatedIndividual = await individualService.updateIndividual(id, individual);
      
      set(state => ({
        individuals: state.individuals.map(ind => 
          ind.id === id ? updatedIndividual : ind
        ),
        isLoading: false
      }));
      
      return updatedIndividual;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteIndividual: async (id) => {
    try {
      set({ isLoading: true });
      await individualService.deleteIndividual(id);
      set(state => ({
        individuals: state.individuals.filter(individual => individual.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Conversations
  addConversation: async (conversationData) => {
    try {
      set({ isLoading: true });
      const newConversation = await conversationService.createConversation(conversationData);
      set(state => ({
        conversations: [...state.conversations, newConversation],
        isLoading: false
      }));
      return newConversation;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateConversation: async (id, conversationData) => {
    try {
      set({ isLoading: true });
      // Tag IDs should be passed as part of conversationData
      const updatedConversation = await conversationService.updateConversation(id, conversationData);
      set(state => ({
        conversations: state.conversations.map(conversation => 
          conversation.id === id ? updatedConversation : conversation
        ),
        isLoading: false
      }));
      return updatedConversation;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteConversation: async (id) => {
    try {
      set({ isLoading: true });
      await conversationService.deleteConversation(id);
      set(state => ({
        conversations: state.conversations.filter(conversation => conversation.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Auth actions
  initializeAuth: async () => {
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: !!user });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const { user } = await authService.signIn(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await authService.signOut();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // New functions
  updateIndividualWithTags: async (individualId: string, tagIds: string[]) => {
    try {
      // Get the tags from the state
      const state = get();
      const relevantTags = state.tags.filter(tag => tagIds.includes(tag.id));
      
      // Update the individual in the state to include these tags
      set(state => ({
        individuals: state.individuals.map(ind => 
          ind.id === individualId 
            ? { ...ind, tags: relevantTags }
            : ind
        )
      }));
    } catch (error) {
      console.error('Error updating individual tags in store:', error);
    }
  },

  updateCompanyWithTags: async (id, tagIds) => {
    try {
      set({ isLoading: true });
      
      // Fetch the updated company with tags
      const updatedCompany = await companyService.getCompany(id);
      
      // Update the company in the store
      set(state => ({
        companies: state.companies.map(company => 
          company.id === id ? updatedCompany : company
        ),
        isLoading: false
      }));
      
      return updatedCompany;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));

// Utility functions to filter data based on search query and tags
export const useFilteredIndividuals = () => {
  const { individuals, searchQuery, selectedTags } = useCRMStore();
  
  return individuals.filter((individual) => {
    const matchesSearch =
      searchQuery === '' ||
      individual.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      individual.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (individual.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (individual.role?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (individual.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesTags =
      selectedTags.length === 0 ||
      (individual.tags?.some((tag) => selectedTags.includes(tag.id)) ?? false);
    
    return matchesSearch && matchesTags;
  });
};

export const useFilteredCompanies = () => {
  const { companies, searchQuery, selectedTags } = useCRMStore();
  
  return companies.filter((company) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === '' ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.website?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (company.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    // Filter by selected tags
    const matchesTags =
      selectedTags.length === 0 ||
      (company.tags?.some((tag) => selectedTags.includes(tag.id)) ?? false);
    
    return matchesSearch && matchesTags;
  });
};

export const useFilteredConversations = () => {
  const { conversations, searchQuery, selectedTags } = useCRMStore();
  
  return conversations.filter((conversation) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === '' ||
      conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conversation.nextSteps?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    // Filter by selected tags
    const matchesTags =
      selectedTags.length === 0 ||
      (conversation.tags?.some((tag) => selectedTags.includes(tag.id)) ?? false);
    
    return matchesSearch && matchesTags;
  });
};
