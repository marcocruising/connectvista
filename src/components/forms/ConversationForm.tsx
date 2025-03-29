import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCRMStore } from '@/store/crmStore';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Tag } from '@/types/crm';
import { Conversation } from '@/types/crm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { IndividualForm } from '@/components/forms/IndividualForm';
import { CompanyForm } from '@/components/forms/CompanyForm';
import { TagForm } from '@/components/forms/TagForm';

const conversationSchema = z.object({
  title: z.string().optional(),
  date: z.date({
    required_error: "Date is required",
  }),
  summary: z.string().optional(),
  nextSteps: z.string().optional(),
});

type ConversationFormData = z.infer<typeof conversationSchema>;

interface ConversationFormProps {
  initialData?: Conversation;
  initialCompanyId?: string;
  initialIndividualIds?: string[];
  onSuccess: () => void;
}

export const ConversationForm: React.FC<ConversationFormProps> = ({
  initialData,
  initialCompanyId,
  initialIndividualIds = [],
  onSuccess
}) => {
  const { 
    addConversation, 
    updateConversation, 
    companies, 
    individuals, 
    fetchCompanies, 
    fetchIndividuals,
    fetchTags,
    tags,
  } = useCRMStore();

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(
    initialData?.companyId || initialCompanyId
  );
  
  const [selectedIndividualIds, setSelectedIndividualIds] = useState<string[]>(
    initialData?.individualIds || initialIndividualIds || []
  );

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags?.map((tag: Tag) => tag.id) || []
  );

  // Add new state for the individual form dialog
  const [isIndividualFormOpen, setIsIndividualFormOpen] = useState(false);
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [isTagFormOpen, setIsTagFormOpen] = useState(false);

  // New states for participant search
  const [participantSearchQuery, setParticipantSearchQuery] = useState('');
  const [showParticipantResults, setShowParticipantResults] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Form setup
  const form = useForm<ConversationFormData>({
    resolver: zodResolver(conversationSchema),
    defaultValues: {
      title: initialData?.title || '',
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      summary: initialData?.summary || '',
      nextSteps: initialData?.nextSteps || '',
    },
  });

  // Fetch necessary data
  useEffect(() => {
    fetchCompanies();
    fetchIndividuals();
    fetchTags();
  }, [fetchCompanies, fetchIndividuals, fetchTags]);

  // Filter individuals based on search query
  const filteredIndividuals = individuals.filter(individual => {
    const fullName = `${individual.first_name} ${individual.last_name}`.toLowerCase();
    return fullName.includes(participantSearchQuery.toLowerCase());
  });

  // Sort individuals to prioritize company-associated individuals and recently interacted with
  const sortedIndividuals = [...filteredIndividuals].sort((a, b) => {
    // First prioritize selected company individuals
    if (selectedCompanyId) {
      if (a.company_id === selectedCompanyId && b.company_id !== selectedCompanyId) return -1;
      if (a.company_id !== selectedCompanyId && b.company_id === selectedCompanyId) return 1;
    }
    
    // Then sort alphabetically
    return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
  });

  // Get just the selected individuals for display
  const selectedIndividuals = individuals.filter(individual => 
    selectedIndividualIds.includes(individual.id)
  );

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowParticipantResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Remove a participant
  const removeParticipant = (individualId: string) => {
    setSelectedIndividualIds(prev => prev.filter(id => id !== individualId));
  };

  // Handle individual selection
  const handleIndividualSelection = (individualId: string) => {
    setSelectedIndividualIds(prev => 
      prev.includes(individualId)
        ? prev.filter(id => id !== individualId)
        : [...prev, individualId]
    );
  };

  // Handle tag selection
  const handleTagSelection = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Get company-associated individuals
  const companyIndividuals = selectedCompanyId 
    ? individuals.filter(individual => individual.company_id === selectedCompanyId)
    : [];

  // Handle successful individual creation
  const handleIndividualCreated = (newIndividualId: string) => {
    // Add the newly created individual to the selected individuals
    setSelectedIndividualIds(prev => [...prev, newIndividualId]);
    setIsIndividualFormOpen(false);
  };

  // Handle successful company creation
  const handleCompanyCreated = (newCompanyId: string) => {
    setSelectedCompanyId(newCompanyId);
    setIsCompanyFormOpen(false);
  };

  // Handle successful tag creation
  const handleTagCreated = (newTagId: string) => {
    setSelectedTagIds(prev => [...prev, newTagId]);
    setIsTagFormOpen(false);
  };

  // Handle form submission
  const onSubmit = async (data: ConversationFormData) => {
    try {
      const conversationData = {
        ...data,
        // Set default title if none provided
        title: data.title || "Conversation",
        date: data.date.toISOString(),
        companyId: selectedCompanyId,
        // Use empty string instead of null for summary if not provided
        summary: data.summary || "",
        nextSteps: data.nextSteps || null,
        tags: selectedTagIds,
        individualIds: selectedIndividualIds
      };

      if (initialData?.id) {
        await updateConversation(initialData.id, conversationData);
      } else {
        await addConversation(conversationData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...form.register('title')}
          placeholder="Conversation Title (optional)"
        />
        {form.formState.errors.title && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !form.watch('date') && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {form.watch('date') ? format(form.watch('date'), 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={form.watch('date')}
              onSelect={date => form.setValue('date', date as Date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {form.formState.errors.date && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.date.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="company">Company</Label>
        <div className="flex space-x-2 items-center">
          <div className="flex-grow">
            <Select
              value={selectedCompanyId || "none"}
              onValueChange={(value) => setSelectedCompanyId(value === "none" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Updated Company Button with text */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsCompanyFormOpen(true)}
            className="flex items-center text-blue-600 hover:text-blue-800 whitespace-nowrap"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Create New Company
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Participants</Label>
        
        {/* Combined participant search and selection area */}
        <div className="border p-2 rounded">
          {/* Top row with search input and add button side by side */}
          <div className="flex space-x-2 mb-3">
            {/* Search input takes most of the space */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search participants..."
                className="pl-10 pr-4 w-full"
                value={participantSearchQuery}
                onChange={(e) => setParticipantSearchQuery(e.target.value)}
                onFocus={() => setShowParticipantResults(true)}
              />
              
              {/* Search results dropdown */}
              {showParticipantResults && (
                <div 
                  ref={searchResultsRef}
                  className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg"
                >
                  <div className="p-2">
                    {sortedIndividuals.length > 0 ? (
                      sortedIndividuals.map(individual => (
                        <div
                          key={individual.id}
                          className={`
                            p-2 cursor-pointer rounded-md flex items-center justify-between
                            ${selectedIndividualIds.includes(individual.id) ? 'bg-blue-50' : 'hover:bg-gray-100'}
                            ${selectedCompanyId && individual.company_id === selectedCompanyId ? 'border-l-4 border-blue-400 pl-1' : ''}
                          `}
                          onClick={() => {
                            handleIndividualSelection(individual.id);
                            setParticipantSearchQuery('');
                          }}
                        >
                          <span>
                            {individual.first_name} {individual.last_name}
                            {individual.company_id && (
                              <span className="text-xs text-gray-500 ml-1">
                                {companies.find(c => c.id === individual.company_id)?.name}
                              </span>
                            )}
                          </span>
                          {selectedIndividualIds.includes(individual.id) && (
                            <span className="text-blue-500 text-sm">✓</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm p-2">No matching individuals found</p>
                    )}
                    
                    {/* Create individual option at the bottom */}
                    <div 
                      className="p-2 mt-1 cursor-pointer rounded-md hover:bg-gray-100 text-blue-600 flex items-center border-t border-gray-100"
                      onClick={() => {
                        setIsIndividualFormOpen(true);
                        setShowParticipantResults(false);
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      <span>Create new individual</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Update the participant section button to have blue text */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsIndividualFormOpen(true)}
              className="flex items-center text-blue-600 hover:text-blue-800 whitespace-nowrap"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Create New Individual
            </Button>
          </div>
          
          {/* Selected participants shown below */}
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {selectedIndividuals.length > 0 ? (
              selectedIndividuals.map(individual => (
                <div 
                  key={individual.id}
                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md flex items-center text-sm"
                >
                  <span>{individual.first_name} {individual.last_name}</span>
                  <button
                    type="button"
                    className="ml-1 hover:text-blue-900"
                    onClick={() => removeParticipant(individual.id)}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No participants selected</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 border p-2 rounded min-h-[60px]">
          {tags.map((tag) => (
            <Button
              key={tag.id}
              type="button"
              variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
              size="sm"
              onClick={() => handleTagSelection(tag.id)}
              style={{
                backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : 'transparent',
                borderColor: tag.color,
                color: selectedTagIds.includes(tag.id) ? 'white' : tag.color,
              }}
            >
              {tag.name}
            </Button>
          ))}
          {tags.length === 0 && (
            <p className="text-gray-400 text-sm">No tags available</p>
          )}
          
          {/* Add Tag Button - moved inside the selection area */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsTagFormOpen(true)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Create New Tag
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          {...form.register('summary')}
          placeholder="Enter conversation summary (optional)"
          rows={4}
        />
        {form.formState.errors.summary && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.summary.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="nextSteps">Next Steps</Label>
        <Textarea
          id="nextSteps"
          {...form.register('nextSteps')}
          placeholder="Enter next steps or action items"
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full">
        {initialData?.id ? 'Update Conversation' : 'Add Conversation'}
      </Button>
      
      {/* Individual Creation Dialog */}
      <Dialog open={isIndividualFormOpen} onOpenChange={setIsIndividualFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Individual</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new contact.
            </DialogDescription>
          </DialogHeader>
          <IndividualForm 
            initialCompanyId={selectedCompanyId} 
            onSuccess={(newIndividualId) => handleIndividualCreated(newIndividualId)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Company Creation Dialog */}
      <Dialog open={isCompanyFormOpen} onOpenChange={setIsCompanyFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new company.
            </DialogDescription>
          </DialogHeader>
          <CompanyForm 
            onSuccess={(newCompanyId) => handleCompanyCreated(newCompanyId)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Tag Creation Dialog */}
      <Dialog open={isTagFormOpen} onOpenChange={setIsTagFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Tag</DialogTitle>
            <DialogDescription>
              Create a new tag to categorize conversations.
            </DialogDescription>
          </DialogHeader>
          <TagForm 
            onSuccess={(newTagId) => handleTagCreated(newTagId)} 
          />
        </DialogContent>
      </Dialog>
    </form>
  );
}; 