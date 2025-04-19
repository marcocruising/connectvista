import { useCRMStore } from '@/store/crmStore';
import { Conversation } from '@/types/crm';

export const useFilteredConversations = () => {
  const { conversations, companies, individuals, searchQuery, selectedTags, selectedCreator } = useCRMStore();
  
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
    const matchesTags = selectedTags.length === 0 || 
      conversation.tags?.some(tag => selectedTags.includes(tag.id));
    
    // Filter by selected creator
    const matchesCreator = !selectedCreator || conversation.created_by === selectedCreator;
    
    return matchesSearch && matchesTags && matchesCreator;
  });
}; 