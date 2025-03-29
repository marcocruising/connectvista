import { useState, useEffect, useRef } from 'react';
import { useCRMStore } from '@/store/crmStore';
import { Search, User, Building2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/shared/SearchBar';

const GlobalSearch = () => {
  const { companies, individuals, conversations } = useCRMStore();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter function to search across all entities
  const getSearchResults = () => {
    if (!searchQuery.trim()) return { companies: [], individuals: [], conversations: [] };
    
    const query = searchQuery.toLowerCase();
    
    // Search companies
    const filteredCompanies = companies.filter(company => {
      return (
        company.name?.toLowerCase().includes(query) ||
        company.website?.toLowerCase().includes(query) ||
        company.description?.toLowerCase().includes(query) ||
        company.email?.toLowerCase().includes(query) ||
        company.phone?.toLowerCase().includes(query) ||
        (company.tags && company.tags.some(tag => tag.name.toLowerCase().includes(query)))
      );
    }).slice(0, 5); // Limit to 5 results
    
    // Search individuals
    const filteredIndividuals = individuals.filter(individual => {
      return (
        individual.first_name?.toLowerCase().includes(query) ||
        individual.last_name?.toLowerCase().includes(query) ||
        `${individual.first_name} ${individual.last_name}`.toLowerCase().includes(query) ||
        individual.email?.toLowerCase().includes(query) ||
        individual.phone?.toLowerCase().includes(query) ||
        individual.role?.toLowerCase().includes(query) ||
        (individual.tags && individual.tags.some(tag => tag.name.toLowerCase().includes(query)))
      );
    }).slice(0, 5); // Limit to 5 results
    
    // Search conversations
    const filteredConversations = conversations.filter(conversation => {
      // Check direct conversation fields
      const directMatch = (
        conversation.title?.toLowerCase().includes(query) ||
        conversation.summary?.toLowerCase().includes(query) ||
        conversation.nextSteps?.toLowerCase().includes(query) ||
        conversation.notes?.toLowerCase().includes(query) ||
        (conversation.tags && conversation.tags.some(tag => tag.name.toLowerCase().includes(query)))
      );
      
      if (directMatch) return true;
      
      // Check company name
      if (conversation.companyId) {
        const company = companies.find(c => c.id === conversation.companyId);
        if (company && company.name.toLowerCase().includes(query)) {
          return true;
        }
      }
      
      // Check participant names
      if (conversation.individualIds && conversation.individualIds.length > 0) {
        const matchingIndividuals = individuals.filter(
          ind => conversation.individualIds.includes(ind.id) && (
            ind.first_name.toLowerCase().includes(query) ||
            ind.last_name.toLowerCase().includes(query) ||
            `${ind.first_name} ${ind.last_name}`.toLowerCase().includes(query)
          )
        );
        
        if (matchingIndividuals.length > 0) {
          return true;
        }
      }
      
      return false;
    }).slice(0, 5); // Limit to 5 results
    
    return {
      companies: filteredCompanies,
      individuals: filteredIndividuals,
      conversations: filteredConversations
    };
  };
  
  const searchResults = getSearchResults();
  const hasResults = searchResults.companies.length > 0 || 
                     searchResults.individuals.length > 0 || 
                     searchResults.conversations.length > 0;
                     
  // Focus search input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim() || !text) return <span>{text}</span>;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <span key={i} className="bg-yellow-100 dark:bg-yellow-800">{part}</span> 
            : part
        )}
      </span>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer md:w-[300px]">
          <Search className="mr-2 h-4 w-4 opacity-50" />
          <span className="text-muted-foreground">Search contacts, companies, conversations...</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px] md:w-[400px]" align="start">
        <Command>
          <CommandInput 
            placeholder="Search everything..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            ref={inputRef}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            
            {hasResults && (
              <>
                {searchResults.companies.length > 0 && (
                  <CommandGroup heading="Companies">
                    {searchResults.companies.map(company => (
                      <CommandItem 
                        key={company.id}
                        onSelect={() => {
                          setOpen(false);
                          setSearchQuery('');
                        }}
                        className="cursor-pointer"
                      >
                        <Link 
                          to={`/companies/${company.id}`} 
                          className="flex items-center w-full"
                        >
                          <Building2 className="mr-2 h-4 w-4" />
                          <span>{highlightText(company.name, searchQuery)}</span>
                        </Link>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {searchResults.individuals.length > 0 && (
                  <CommandGroup heading="Individuals">
                    {searchResults.individuals.map(individual => (
                      <CommandItem 
                        key={individual.id}
                        onSelect={() => {
                          setOpen(false);
                          setSearchQuery('');
                        }}
                        className="cursor-pointer"
                      >
                        <Link 
                          to={`/individuals/${individual.id}`} 
                          className="flex items-center w-full"
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>{highlightText(`${individual.first_name} ${individual.last_name}`, searchQuery)}</span>
                          {individual.role && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {highlightText(individual.role, searchQuery)}
                            </span>
                          )}
                        </Link>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {searchResults.conversations.length > 0 && (
                  <CommandGroup heading="Conversations">
                    {searchResults.conversations.map(conversation => {
                      // Find company and individuals associated with this conversation
                      const company = conversation.companyId ? 
                        companies.find(c => c.id === conversation.companyId) : null;
                      
                      const conversationIndividuals = conversation.individualIds ?
                        individuals.filter(ind => conversation.individualIds.includes(ind.id)) : [];
                      
                      // Check if the search term matches company or individuals rather than the conversation directly
                      const directMatch = 
                        conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        conversation.summary.toLowerCase().includes(searchQuery.toLowerCase());
                        
                      const companyMatch = company && 
                        company.name.toLowerCase().includes(searchQuery.toLowerCase());
                        
                      const individualMatch = conversationIndividuals.some(ind => 
                        ind.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        ind.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        `${ind.first_name} ${ind.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      
                      return (
                        <CommandItem 
                          key={conversation.id}
                          onSelect={() => {
                            setOpen(false);
                            setSearchQuery('');
                          }}
                          className="cursor-pointer"
                        >
                          <Link 
                            to={`/conversations/${conversation.id}`} 
                            className="flex items-center w-full"
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <span>{highlightText(conversation.title, searchQuery)}</span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {highlightText(new Date(conversation.date).toLocaleDateString(), searchQuery)}
                                </span>
                              </div>
                              
                              {/* Show context of why this conversation matched */}
                              {(companyMatch || individualMatch) && (
                                <span className="text-xs text-muted-foreground">
                                  {highlightText(companyMatch ? `Company: ${company?.name}` : '', searchQuery)}
                                  {companyMatch && individualMatch && ' • '}
                                  {individualMatch && 'Participants: ' + 
                                    conversationIndividuals
                                      .filter(ind => 
                                        ind.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        ind.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        `${ind.first_name} ${ind.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
                                      )
                                      .map(ind => highlightText(`${ind.first_name} ${ind.last_name}`, searchQuery))
                                      .join(', ')
                                  }
                                </span>
                              )}
                            </div>
                          </Link>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default GlobalSearch; 