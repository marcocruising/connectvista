import { create } from 'zustand';
import { Tag, Company, Individual, Conversation, Reminder } from '@/types/crm';
import { tagService } from '@/services/tagService';
import { companyService } from '@/services/companyService';
import { individualService } from '@/services/individualService';
import { conversationService } from '@/services/conversationService';
import { authService } from '@/services/authService';
import { reminderService } from '@/services/reminderService';
import { supabase } from '@/lib/supabase';
import React from 'react';
import { bucketCollaboratorService } from '@/services/bucketCollaboratorService';

interface CRMState {
  // Data
  companies: Company[];
  individuals: Individual[];
  conversations: Conversation[];
  tags: Tag[];
  reminders: Reminder[];
  
  // UI state
  searchQuery: string;
  selectedTags: string[];
  selectedCreator: string | null;
  isLoading: boolean;
  error: string | null;
  isLoadingReminders: boolean;
  
  // Auth state
  user: any | null;
  isAuthenticated: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tagIds: string[]) => void;
  setSelectedCreator: (creator: string | null) => void;
  clearError: () => void;
  
  // Data fetching
  fetchTags: () => Promise<void>;
  fetchCompanies: (bucketId: string) => Promise<void>;
  fetchIndividuals: (bucketId: string) => Promise<void>;
  fetchConversations: (bucketId: string) => Promise<void>;
  fetchReminders: () => Promise<void>;
  
  // CRUD operations
  addTag: (tag: Omit<Tag, 'id' | 'created_at' | 'created_by'>) => Promise<void>;
  updateTag: (id: string, tag: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  
  addCompany: (company: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => Promise<Company>;
  updateCompany: (id: string, company: Partial<Company>) => Promise<Company>;
  deleteCompany: (id: string) => Promise<void>;
  
  addIndividual: (individual: Omit<Individual, 'id' | 'created_at' | 'updated_at' | 'created_by'>, bucketId: string) => Promise<Individual>;
  updateIndividual: (id: string, individual: Partial<Individual>) => Promise<Individual>;
  deleteIndividual: (id: string) => Promise<void>;
  
  addConversation: (conversation: Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'created_by'>, tags: string[], individualIds: string[], bucketId: string) => Promise<Conversation>;
  updateConversation: (id: string, conversation: Partial<Conversation>) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  
  // Auth actions
  initializeAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // New functions
  updateIndividualWithTags: (individualId: string, tagIds: string[]) => Promise<void>;
  updateCompanyWithTags: (companyId: string, tagIds: string[], bucketId?: string) => Promise<Company>;
  
  // Reminder actions
  createReminder: (reminderData: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateReminder: (id: string, reminderData: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  markReminderComplete: (id: string) => Promise<void>;
  dismissReminder: (id: string) => Promise<void>;
  
  // Add signInWithGoogle to the interface
  signInWithGoogle: () => Promise<void>;
  
  // Collaborators
  collaborators: any[];
  isLoadingCollaborators: boolean;
  fetchCollaborators: (bucketId?: string) => Promise<void>;
  inviteCollaborator: (email: string, bucketId?: string) => Promise<void>;
  removeCollaborator: (collaboratorId: string) => Promise<void>;
  leaveCurrentBucket: () => Promise<void>;
  
  // New additions
  pendingInvites: any[];
  fetchPendingInvites: () => Promise<void>;
  transferOwnership: (bucketId: string, newOwnerId: string) => Promise<void>;
  
  // New function to accept an invite
  acceptInvite: (bucketId: string) => Promise<void>;
  
  // New function to cancel a pending invite by email
  cancelInvite: (email: string, bucketId?: string) => Promise<void>;
}

// TODO: Replace with dynamic bucket selection logic in the future
export const DEFAULT_BUCKET_ID = '6c83917d-12b8-4f1c-8be5-1b4403e5f5d4';

// Add types for bucket
export interface Bucket {
  id: string;
  name: string;
  owner_id: string;
  members: number;
}

export const useCRMStore = create<CRMState & {
  currentBucketId: string | null;
  setCurrentBucketId: (bucketId: string) => void;
  buckets: Bucket[];
  setBuckets: (buckets: Bucket[]) => void;
  fetchBuckets: () => Promise<void>;
  initializeBucketData: () => Promise<void>;
  clearAllState: () => void;
  needsBucketOnboarding?: boolean;
}>(
  (set, get) => ({
  // Initial state
  companies: [],
  individuals: [],
  conversations: [],
  tags: [],
  reminders: [],
  searchQuery: '',
  selectedTags: [],
  selectedCreator: null,
  isLoading: false,
  error: null,
  isLoadingReminders: false,
    pendingInvites: [],
  needsBucketOnboarding: false,

  // Auth state
  user: null,
  isAuthenticated: false,

  // UI actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTags: (tagIds) => set({ selectedTags: tagIds }),
  setSelectedCreator: (creator) => set({ selectedCreator: creator }),
  clearError: () => set({ error: null }),

  // Data fetching
  fetchTags: async () => {
      if (!get().isAuthenticated || !get().currentBucketId) return;
    try {
      set({ isLoading: true });
        const bucketId = get().currentBucketId;
        const tags = await tagService.getTags(bucketId);
      set({ tags, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

    fetchCompanies: async (bucketId?: string) => {
      if (!get().isAuthenticated || !(bucketId || get().currentBucketId)) return;
      const useBucketId = bucketId || get().currentBucketId;
    try {
      set({ isLoading: true });
        const companies = await companyService.getCompanies(useBucketId);
      set({ companies, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

    fetchIndividuals: async (bucketId?: string) => {
      if (!get().isAuthenticated || !(bucketId || get().currentBucketId)) return;
      const useBucketId = bucketId || get().currentBucketId;
    try {
      set({ isLoading: true });
        const individuals = await individualService.getIndividuals(useBucketId);
      set({ individuals, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

    fetchConversations: async (bucketId?: string) => {
      if (!get().isAuthenticated || !(bucketId || get().currentBucketId)) return;
      const useBucketId = bucketId || get().currentBucketId;
    try {
      set({ isLoading: true, error: null });
        const conversations = await conversationService.getConversations(useBucketId);
      set({ conversations, isLoading: false });
      console.log("Fetched conversations in store:", conversations);
    } catch (error) {
      console.error("Error fetching conversations in store:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchReminders: async () => {
      if (!get().isAuthenticated || !get().currentBucketId) return;
    set({ isLoadingReminders: true });
    try {
        const bucketId = get().currentBucketId;
        const reminders = await reminderService.getReminders(bucketId);
      set({ reminders });
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      set({ isLoadingReminders: false });
    }
  },

  // CRUD operations
  addTag: async (tag) => {
    try {
      set({ isLoading: true });
        const bucketId = get().currentBucketId || DEFAULT_BUCKET_ID;
        const newTag = await tagService.createTag(tag, bucketId);
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
        const bucketId = get().currentBucketId || DEFAULT_BUCKET_ID;
        const updatedTag = await tagService.updateTag(id, tag, bucketId);
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
        const bucketId = get().currentBucketId || DEFAULT_BUCKET_ID;
        await tagService.deleteTag(id, bucketId);
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
        const newCompany = await companyService.createCompany(company, DEFAULT_BUCKET_ID);
      set(state => ({ 
        companies: [...state.companies, newCompany], 
        isLoading: false 
      }));
        return newCompany;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
        throw error;
    }
  },

  updateCompany: async (id, companyData) => {
    try {
      set({ isLoading: true });
        const updatedCompany = await companyService.updateCompany(id, companyData, DEFAULT_BUCKET_ID);
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

  deleteCompany: async (id) => {
    try {
      set({ isLoading: true });
        await companyService.deleteCompany(id, DEFAULT_BUCKET_ID);
      set(state => ({
        companies: state.companies.filter(company => company.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Individuals
    addIndividual: async (individual, bucketId) => {
    try {
      set({ isLoading: true });
      // Extract tags to handle them separately
      const { tags, ...individualData } = individual as any;
        const newIndividual = await individualService.createIndividual(individualData, bucketId);
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
    addConversation: async (conversation, tagIds, individualIds, bucketId) => {
    try {
      set({ isLoading: true, error: null });
      const conversationData = {
        ...conversation,
        tags: tagIds,
        individualIds
      };
      console.log("Adding conversation in store:", conversationData);
        const newConversation = await conversationService.createConversation(conversationData, bucketId);
      set(state => ({
        conversations: [...state.conversations, newConversation],
        isLoading: false
      }));
      console.log("Added conversation in store:", newConversation);
      return newConversation;
    } catch (error) {
      console.error("Error adding conversation in store:", error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateConversation: async (id, conversationData) => {
    try {
      set({ isLoading: true, error: null });
      console.log("Updating conversation in store:", id, conversationData);
        const bucketId = get().currentBucketId || DEFAULT_BUCKET_ID;
        await conversationService.updateConversation(id, conversationData, bucketId);
      // After updating in the database, refetch all conversations to ensure state is in sync
        await get().fetchConversations(bucketId);
      set({ isLoading: false });
    } catch (error) {
      console.error("Error updating conversation in store:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteConversation: async (id) => {
    try {
      set({ isLoading: true, error: null });
      console.log("Deleting conversation in store:", id);
      await conversationService.deleteConversation(id);
      set(state => ({
        conversations: state.conversations.filter(conversation => conversation.id !== id),
        isLoading: false
      }));
      console.log("Deleted conversation in store");
    } catch (error) {
      console.error("Error deleting conversation in store:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Auth actions
  initializeAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;
      
      set({ 
        user,
        isAuthenticated: !!user,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize auth'
      });
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
        localStorage.removeItem('currentBucketId');
        set({ user: null, isAuthenticated: false, isLoading: false, currentBucketId: null });
        get().clearAllState();
      window.location.reload();
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

    updateCompanyWithTags: async (companyId, tagIds, bucketId = DEFAULT_BUCKET_ID) => {
    try {
      set({ isLoading: true });
        await companyService.updateCompanyTags(companyId, tagIds, bucketId);
        const updatedCompany = await companyService.getCompany(companyId, bucketId);
      set(state => ({
        companies: state.companies.map(company => 
            company.id === companyId ? updatedCompany : company
        ),
        isLoading: false
      }));
      return updatedCompany;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  // Reminder actions
  createReminder: async (reminderData) => {
    try {
        const bucketId = get().currentBucketId || DEFAULT_BUCKET_ID;
        const newReminder = await reminderService.createReminder(reminderData, bucketId);
      set((state) => ({
        reminders: [...state.reminders, newReminder]
      }));
    } catch (error) {
      console.error("Error creating reminder:", error);
    }
  },

  updateReminder: async (id, reminderData) => {
    try {
        const bucketId = get().currentBucketId || DEFAULT_BUCKET_ID;
        const updatedReminder = await reminderService.updateReminder(id, reminderData, bucketId);
      set((state) => ({
        reminders: state.reminders.map(reminder => 
          reminder.id === id ? updatedReminder : reminder
        )
      }));
    } catch (error) {
      console.error("Error updating reminder:", error);
    }
  },

  deleteReminder: async (id) => {
    try {
        const bucketId = get().currentBucketId || DEFAULT_BUCKET_ID;
        await reminderService.deleteReminder(id, bucketId);
      set((state) => ({
        reminders: state.reminders.filter(reminder => reminder.id !== id)
      }));
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  },

  markReminderComplete: async (id) => {
    try {
        const bucketId = get().currentBucketId || DEFAULT_BUCKET_ID;
        const updatedReminder = await reminderService.markReminderAsComplete(id, bucketId);
      set((state) => ({
        reminders: state.reminders.map(reminder => 
          reminder.id === id ? updatedReminder : reminder
        )
      }));
    } catch (error) {
      console.error("Error marking reminder as complete:", error);
    }
  },

  dismissReminder: async (id) => {
    try {
        const bucketId = get().currentBucketId || DEFAULT_BUCKET_ID;
        const updatedReminder = await reminderService.dismissReminder(id, bucketId);
      set((state) => ({
        reminders: state.reminders.map(reminder => 
          reminder.id === id ? updatedReminder : reminder
        )
      }));
    } catch (error) {
      console.error("Error dismissing reminder:", error);
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ error: null, isLoading: true });
      get().clearAllState();
      const response = await authService.signInWithGoogle();
      // The response will contain a URL for OAuth redirect
      if (response.url) {
        // Store the current state before redirect
        localStorage.setItem('preAuthState', JSON.stringify({
          path: window.location.pathname,
          search: window.location.search
        }));
        // Redirect to Google OAuth
        window.location.href = response.url;
      } else {
        throw new Error('No OAuth URL received from Google sign-in');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign in with Google',
        isLoading: false 
      });
    }
  },

    currentBucketId: localStorage.getItem('currentBucketId') || DEFAULT_BUCKET_ID,
    setCurrentBucketId: (bucketId: string) => {
      const validBucketIds = get().buckets.map(b => b.id);
      if (validBucketIds.includes(bucketId)) {
        localStorage.setItem('currentBucketId', bucketId);
        set({ currentBucketId: bucketId });
      } else {
        localStorage.removeItem('currentBucketId');
        set({ currentBucketId: null });
      }
    },
    buckets: [],
    setBuckets: (buckets: Bucket[]) => set({ buckets }),
    fetchBuckets: async () => {
      // Fetch buckets where the user is owner or active collaborator
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Buckets owned by user
      const { data: ownedBuckets, error: ownedError } = await supabase
        .from('buckets')
        .select('id, name, owner_id, bucket_collaborators(count)')
        .eq('owner_id', user.id);
      // Buckets where user is active collaborator
      const { data: collabRows, error: collabError } = await supabase
        .from('bucket_collaborators')
        .select('bucket_id')
        .eq('user_id', user.id)
        .eq('status', 'active');
      const collabBucketIds = (collabRows || []).map(row => row.bucket_id);
      let collabBuckets = [];
      if (collabBucketIds.length > 0) {
        const { data: cb, error: cbError } = await supabase
          .from('buckets')
          .select('id, name, owner_id, bucket_collaborators(count)')
          .in('id', collabBucketIds);
        collabBuckets = cb || [];
      }
      let buckets = [...(ownedBuckets || []), ...collabBuckets];
      // If user has no buckets, auto-create a personal bucket
      if (buckets.length === 0) {
        // Use user's name or email for bucket name
        const bucketName = user.user_metadata?.full_name
          ? `${user.user_metadata.full_name.split(' ')[0]}'s Bucket`
          : user.email
            ? `${user.email.split('@')[0]}'s Bucket`
            : 'Personal Bucket';
        const now = new Date().toISOString();
        // Insert new bucket
        const { data: newBucket, error: createError } = await supabase
          .from('buckets')
          .insert({
            name: bucketName,
            owner_id: user.id,
            created_at: now,
            updated_at: now
          })
          .select('id, name, owner_id, bucket_collaborators(count)')
          .single();
        if (!createError && newBucket) {
          buckets = [newBucket];
          set({ buckets, currentBucketId: newBucket.id, needsBucketOnboarding: false });
        } else {
          set({ needsBucketOnboarding: true });
          return;
        }
      } else {
        set({ buckets, needsBucketOnboarding: false });
      }
      // Only allow currentBucketId to be a bucket the user is a member of
      const validBucketIds = buckets.map(b => b.id);
      let currentBucketId = get().currentBucketId;
      if (!validBucketIds.includes(currentBucketId)) {
        currentBucketId = buckets.length > 0 ? buckets[0].id : null;
        set({ currentBucketId });
      }
      // If no valid bucket, clear all data/collaborators
      if (!currentBucketId) {
        set({ collaborators: [], pendingInvites: [], error: null });
        // Optionally clear other data slices here
      }
    },
    collaborators: [],
    isLoadingCollaborators: false,
    
    fetchCollaborators: async (bucketId?: string) => {
      set({ isLoadingCollaborators: true });
      try {
        const useBucketId = bucketId || get().currentBucketId;
        const validBucketIds = get().buckets.map(b => b.id);
        if (!useBucketId || !validBucketIds.includes(useBucketId)) {
          set({ collaborators: [] });
          return;
        }
        const collaborators = await bucketCollaboratorService.listCollaborators(useBucketId);
        set({ collaborators });
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoadingCollaborators: false });
      }
    },

    inviteCollaborator: async (email: string, bucketId?: string) => {
      set({ isLoadingCollaborators: true });
      try {
        if (!email) throw new Error('Email is required to invite a collaborator');
        const useBucketId = bucketId || get().currentBucketId || DEFAULT_BUCKET_ID;
        // Check if a removed invite exists for this email and bucket
        const { data: existing, error: findError } = await supabase
          .from('bucket_collaborators')
          .select('*')
          .eq('bucket_id', useBucketId)
          .eq('email', email)
          .eq('status', 'removed')
          .maybeSingle();
        if (findError) throw findError;
        if (existing) {
          // Re-invite by updating status to pending
          await supabase
            .from('bucket_collaborators')
            .update({ status: 'pending', invited_at: new Date().toISOString(), invited_by: get().user?.id, removed_by: null, removed_at: null, email })
            .eq('id', existing.id);
        } else {
          await bucketCollaboratorService.inviteCollaborator(email, useBucketId);
        }
        // Refresh list after invite
        await get().fetchCollaborators(useBucketId);
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoadingCollaborators: false });
      }
    },

    removeCollaborator: async (collaboratorId: string) => {
      set({ isLoadingCollaborators: true });
      try {
        await bucketCollaboratorService.removeCollaborator(collaboratorId);
        // Refresh list after removal
        await get().fetchCollaborators();
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoadingCollaborators: false });
      }
    },

    leaveCurrentBucket: async () => {
      set({ isLoadingCollaborators: true });
      try {
        const bucketId = get().currentBucketId || DEFAULT_BUCKET_ID;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        // Check if user is owner
        const { data: bucket } = await supabase
          .from('buckets')
          .select('owner_id')
          .eq('id', bucketId)
          .single();
        if (bucket && bucket.owner_id === user.id) {
          // Check for other active collaborators
          const { data: others } = await supabase
            .from('bucket_collaborators')
            .select('id')
            .eq('bucket_id', bucketId)
            .eq('status', 'active')
            .neq('user_id', user.id);
          if (!others || others.length === 0) {
            throw new Error('You must add another owner before leaving this bucket.');
          }
          throw new Error('Transfer ownership before leaving this bucket.');
        }
        await bucketCollaboratorService.leaveBucket(bucketId);
        await get().fetchCollaborators(bucketId);
        await get().fetchBuckets();
      } catch (error) {
        // Only set error if it's not a transfer-required error
        if (
          !(error instanceof Error) ||
          (
            !error.message.includes("Transfer ownership before leaving this bucket.") &&
            !error.message.includes("You must add another owner before leaving this bucket.")
          )
        ) {
          set({ error: (error as Error).message });
        }
      } finally {
        set({ isLoadingCollaborators: false });
      }
    },

    // New function to initialize bucket data after login
    initializeBucketData: async () => {
      const { isAuthenticated, currentBucketId } = get();
      if (!isAuthenticated || !currentBucketId) return;
      await Promise.all([
        get().fetchTags(),
        get().fetchCompanies(currentBucketId),
        get().fetchIndividuals(currentBucketId),
        get().fetchConversations(currentBucketId),
        get().fetchReminders(),
      ]);
    },

    fetchPendingInvites: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[fetchPendingInvites] No user found');
        return;
      }
      // Fetch all pending invites and filter in JS for robustness
      const { data: allInvites, error } = await supabase
        .from('bucket_collaborators')
        .select('*, buckets(name)')
        .eq('status', 'pending');
      if (error) {
        set({ error: error.message });
        console.error('[fetchPendingInvites] error:', error.message);
        return;
      }
      // Only invites for this user
      const filtered = (allInvites || []).filter(
        invite => (invite.email || '').toLowerCase() === (user.email || '').toLowerCase()
      );
      // Get all unique inviter IDs
      const inviterIds = [...new Set(filtered.map(invite => invite.invited_by).filter(Boolean))];
      let inviterProfiles = [];
      let inviterUsers = [];
      if (inviterIds.length > 0) {
        // Fetch from profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', inviterIds);
        inviterProfiles = profiles || [];
        // Fetch from users (for email fallback)
        const { data: users } = await supabase
          .from('users')
          .select('id, email')
          .in('id', inviterIds);
        inviterUsers = users || [];
      }
      // Attach inviter info to each invite
      const invitesWithInviter = filtered.map(invite => {
        const profile = inviterProfiles.find(p => p.id === invite.invited_by);
        const user = inviterUsers.find(u => u.id === invite.invited_by);
        return {
          ...invite,
          invited_by_name: profile?.name || (user?.email ? user.email.split('@')[0] : undefined) || undefined,
          invited_by_email: profile?.email || user?.email || undefined,
        };
      });
      set({ pendingInvites: invitesWithInviter });
      console.log('[fetchPendingInvites] pendingInvites with inviter info:', invitesWithInviter);
    },

    transferOwnership: async (bucketId, newOwnerId) => {
      set({ isLoadingCollaborators: true });
      try {
        // Update the bucket owner
        const { error: updateError } = await supabase
          .from('buckets')
          .update({ owner_id: newOwnerId })
          .eq('id', bucketId);
        if (updateError) throw updateError;
        // Remove the old owner's collaborator record (if exists)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('bucket_collaborators')
            .update({ status: 'removed', removed_by: user.id, removed_at: new Date().toISOString() })
            .eq('bucket_id', bucketId)
            .eq('user_id', user.id)
            .eq('status', 'active');
        }
        // Refresh collaborators
        await get().fetchCollaborators(bucketId);
        await get().fetchBuckets();
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoadingCollaborators: false });
      }
    },

    // New function to accept an invite
    acceptInvite: async (bucketId: string) => {
      try {
        console.log('[acceptInvite] Attempting to accept invite for bucket:', bucketId);
        await bucketCollaboratorService.acceptInvite(bucketId);
        await get().fetchBuckets();
        await get().fetchCollaborators(bucketId);
        console.log('[acceptInvite] Invite accepted for bucket:', bucketId);
      } catch (error) {
        set({ error: (error as Error).message });
        console.error('[acceptInvite] error:', error);
      }
    },

    // New function to cancel a pending invite by email
    cancelInvite: async (email: string, bucketId?: string) => {
      set({ isLoadingCollaborators: true });
      try {
        const useBucketId = bucketId || get().currentBucketId || DEFAULT_BUCKET_ID;
        // Find the pending invite for this email and bucket
        const { data: invite, error: findError } = await supabase
          .from('bucket_collaborators')
          .select('*')
          .eq('bucket_id', useBucketId)
          .eq('email', email)
          .eq('status', 'pending')
          .maybeSingle();
        if (findError) throw findError;
        if (invite) {
          await bucketCollaboratorService.removeCollaborator(invite.id);
          await get().fetchCollaborators(useBucketId);
          await get().fetchPendingInvites();
        }
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoadingCollaborators: false });
      }
    },

    // Clear state on login/logout
    clearAllState: () => {
      set({
        currentBucketId: null,
        buckets: [],
        collaborators: [],
        pendingInvites: [],
        error: null,
        // Optionally clear other data slices here
      });
      localStorage.removeItem('currentBucketId');
    },
  })
);

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
  const { conversations, companies, individuals, searchQuery, selectedTags, selectedCreator } = useCRMStore();
  
  return React.useMemo(() => {
    // If no filters are active, return all conversations
    if (searchQuery === '' && selectedTags.length === 0 && !selectedCreator) {
      return conversations;
    }
    
    return conversations.filter((conversation) => {
      // Filter by search query - check all conversation fields
      let matchesSearch = false;
      if (searchQuery === '') {
        matchesSearch = true;
      } else {
        const query = searchQuery.toLowerCase();
        
        // Check direct conversation fields
        matchesSearch = (
          conversation.title.toLowerCase().includes(query) ||
          conversation.summary.toLowerCase().includes(query) ||
          (conversation.nextSteps?.toLowerCase().includes(query) ?? false) ||
          (conversation.notes?.toLowerCase().includes(query) ?? false)
        );
        
        // If no direct match, check associated company
        if (!matchesSearch && conversation.companyId) {
          const company = companies.find(c => c.id === conversation.companyId);
          if (company && company.name.toLowerCase().includes(query)) {
            matchesSearch = true;
          }
        }
        
        // If still no match, check associated individuals
        if (!matchesSearch && conversation.individualIds && conversation.individualIds.length > 0) {
          const matchingIndividuals = individuals.filter(
            ind => conversation.individualIds.includes(ind.id) && (
              ind.first_name.toLowerCase().includes(query) ||
              ind.last_name.toLowerCase().includes(query) ||
              `${ind.first_name} ${ind.last_name}`.toLowerCase().includes(query)
            )
          );
          
          if (matchingIndividuals.length > 0) {
            matchesSearch = true;
          }
        }
        
        // If still no match, check tags
        if (!matchesSearch && conversation.tags) {
          const hasMatchingTag = conversation.tags.some(tag => 
            tag.name.toLowerCase().includes(query)
          );
          
          if (hasMatchingTag) {
            matchesSearch = true;
          }
        }
      }
      
      // Filter by selected tags
      const matchesTags =
        selectedTags.length === 0 ||
        (conversation.tags?.some((tag) => selectedTags.includes(tag.id)) ?? false);
      
      // Filter by selected creator
      const matchesCreator = !selectedCreator || conversation.created_by === selectedCreator;
      
      return matchesSearch && matchesTags && matchesCreator;
    });
  }, [conversations, companies, individuals, searchQuery, selectedTags, selectedCreator]);
};
