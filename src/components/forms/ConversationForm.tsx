import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
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
import { CalendarIcon, PlusCircle, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Tag } from '@/types/crm';
import { Conversation } from '@/types/crm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { IndividualForm } from '@/components/forms/IndividualForm';
import { CompanyForm } from '@/components/forms/CompanyForm';
import { TagForm } from '@/components/forms/TagForm';
import { DEFAULT_BUCKET_ID } from '@/store/crmStore';

const conversationSchema = z.object({
  title: z.string().optional(),
  date: z.date({
    required_error: "Date is required",
  }),
  summary: z.string().optional(),
  nextSteps: z.string().optional(),
  reminder: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    due_date: z.date().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium').optional(),
  }).optional(),
});

type ConversationFormData = z.infer<typeof conversationSchema>;

interface ConversationFormProps {
  initialData?: Conversation;
  initialCompanyId?: string;
  initialIndividualIds?: string[];
  onSuccess: () => void;
  bucketId: string;
}

export const ConversationForm: React.FC<ConversationFormProps> = ({
  initialData,
  initialCompanyId,
  initialIndividualIds = [],
  onSuccess,
  bucketId
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
      reminder: undefined,
    },
  });

  // Track which optional fields are visible
  const [visibleFields, setVisibleFields] = useState<string[]>(
    initialData ? 
      // Show fields that already have data
      [
        ...(initialData.summary ? ['summary'] : []),
        ...(initialData.nextSteps ? ['nextSteps'] : []),
        ...(initialData.reminder ? ['reminder'] : []),
      ] : []
  );

  // Available optional fields that can be added
  const availableOptionalFields = useMemo(() => {
    const allOptionalFields = [
      { id: 'summary', label: 'Summary' },
      { id: 'nextSteps', label: 'Next Steps' },
      { id: 'reminder', label: 'Reminder' },
    ];
    
    // Filter out already visible fields
    return allOptionalFields.filter(field => !visibleFields.includes(field.id));
  }, [visibleFields]);

  // Add an optional field
  const addField = useCallback((fieldId: string) => {
    setVisibleFields(prev => [...prev, fieldId]);
  }, []);

  // Remove an optional field
  const removeField = useCallback((fieldId: string) => {
    setVisibleFields(prev => prev.filter(id => id !== fieldId));
    // Clear the field value
    form.setValue(fieldId as any, '');
  }, [form]);

  // Fetch necessary data
  useEffect(() => {
    fetchCompanies();
    fetchIndividuals(DEFAULT_BUCKET_ID);
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
      // Extract reminder data from form submission
      const { reminder, ...conversationData } = data;
      
      const formattedConversationData = {
        ...conversationData,
        // Set default title if none provided
        title: conversationData.title || "Conversation",
        date: conversationData.date.toISOString(),
        companyId: selectedCompanyId,
        // Use empty string instead of null for summary if not provided
        summary: conversationData.summary || "",
        nextSteps: conversationData.nextSteps || null,
        tags: selectedTagIds,
        individualIds: selectedIndividualIds
      };

      let conversationId;
      if (initialData?.id) {
        await updateConversation(initialData.id, formattedConversationData);
        conversationId = initialData.id;
      } else {
        const newConversation = await addConversation(formattedConversationData, selectedTagIds, selectedIndividualIds, bucketId);
        conversationId = newConversation.id;
      }
      
      // Create a reminder if one was set
      if (reminder && reminder.due_date && conversationId) {
        try {
          await useCRMStore.getState().createReminder({
            conversation_id: conversationId,
            title: reminder.title || formattedConversationData.title,
            description: reminder.description || '',
            due_date: reminder.due_date.toISOString(),
            status: 'pending',
            priority: reminder.priority || 'medium'
          });
        } catch (reminderError) {
          console.error("Failed to create reminder:", reminderError);
          // Don't fail the whole submission if reminder creation fails
        }
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Conversation Title */}
      <div>
        <Input
          id="title"
          {...form.register('title')}
          placeholder="Conversation Title (optional)"
        />
        {form.formState.errors.title && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
        )}
      </div>

      {/* 2. Date - Moved up below title */}
      <div>
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

      {/* 3. Tags */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 min-h-[40px]">
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

      {/* 4. Company */}
      <div>
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
                <SelectItem value="none">Select company</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
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

      {/* 5. Participants */}
      <div className="space-y-2">
        <div className="mb-3">
          <div className="flex space-x-2">
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
          
          <div className="flex flex-wrap gap-2 min-h-[40px] mt-3">
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

      {/* Optional fields section - unchanged */}
      {visibleFields.length > 0 && (
        <div className="border-t pt-4 mt-4 space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Optional Information</h4>
          
          {visibleFields.includes('summary') && (
            <div className="relative">
              <Textarea
                id="summary"
                {...form.register('summary')}
                placeholder="Enter conversation summary"
                rows={4}
              />
              {form.formState.errors.summary && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.summary.message}</p>
              )}
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 top-2 h-6 text-gray-500 hover:text-gray-800"
                onClick={() => removeField('summary')}
              >
                Remove
              </Button>
            </div>
          )}

          {visibleFields.includes('nextSteps') && (
            <div className="relative">
              <Textarea
                id="nextSteps"
                {...form.register('nextSteps')}
                placeholder="Enter next steps or action items"
                rows={2}
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 top-2 h-6 text-gray-500 hover:text-gray-800"
                onClick={() => removeField('nextSteps')}
              >
                Remove
              </Button>
            </div>
          )}

          {visibleFields.includes('reminder') && (
            <div className="relative space-y-3 border p-4 rounded-md">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Set a Reminder</h4>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-gray-500 hover:text-gray-800"
                  onClick={() => removeField('reminder')}
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="reminder-title">Title</Label>
                  <Input
                    id="reminder-title"
                    placeholder="Reminder title"
                    {...form.register('reminder.title')}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reminder-date">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !form.watch('reminder.due_date') && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch('reminder.due_date') ? (
                          format(form.watch('reminder.due_date'), 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch('reminder.due_date')}
                        onSelect={(date) => form.setValue('reminder.due_date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reminder-priority">Priority</Label>
                  <Select
                    onValueChange={(value) => form.setValue('reminder.priority', value as 'low' | 'medium' | 'high')}
                    defaultValue={form.watch('reminder.priority') || 'medium'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reminder-description">Notes</Label>
                  <Textarea
                    id="reminder-description"
                    placeholder="Additional details about this reminder"
                    {...form.register('reminder.description')}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add optional field dropdown - unchanged */}
      <div className={`${visibleFields.length > 0 ? 'mt-2' : 'pt-2 mt-4 border-t'}`}>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              type="button" 
              className="flex items-center text-muted-foreground"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add field
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2">
            <div className="grid gap-1">
              {availableOptionalFields.map(field => (
                <Button 
                  key={field.id} 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start font-normal" 
                  onClick={() => addField(field.id)}
                >
                  {field.label}
                </Button>
              ))}
              {availableOptionalFields.length === 0 && (
                <p className="text-muted-foreground text-sm px-2 py-1">All optional fields added</p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Button 
        type="button"
        className="w-full mt-6"
        onClick={form.handleSubmit(onSubmit)}
      >
        {initialData?.id ? 'Update Conversation' : 'Add Conversation'}
      </Button>
      
      {/* Dialogs */}
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
            bucketId={bucketId}
          />
        </DialogContent>
      </Dialog>
      
      {/* Company dialog */}
      <Dialog open={isCompanyFormOpen} onOpenChange={setIsCompanyFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new company.
            </DialogDescription>
          </DialogHeader>
          <CompanyForm onSuccess={handleCompanyCreated} />
        </DialogContent>
      </Dialog>
      
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
    </div>
  );
}; 