import React, { useEffect, useState } from 'react';
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
import { CalendarIcon, PlusCircle } from 'lucide-react';
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
  title: z.string().min(1, 'Title is required'),
  date: z.date({
    required_error: "Date is required",
  }),
  summary: z.string().min(1, 'Summary is required'),
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
        date: data.date.toISOString(),
        companyId: selectedCompanyId,
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
          placeholder="Conversation Title"
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
        <div className="flex space-x-2">
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
          
          {/* Add Company Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsCompanyFormOpen(true)}
            className="flex-shrink-0"
            title="Add New Company"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Participants</Label>
        <div className="flex flex-wrap gap-2 border p-2 rounded min-h-[60px]">
          {individuals.map((individual) => (
            <Button
              key={individual.id}
              type="button"
              variant={selectedIndividualIds.includes(individual.id) ? "default" : "outline"}
              size="sm"
              onClick={() => handleIndividualSelection(individual.id)}
              className={
                selectedCompanyId && individual.company_id === selectedCompanyId
                ? "border-blue-400"
                : ""
              }
            >
              {individual.first_name} {individual.last_name}
            </Button>
          ))}
          {individuals.length === 0 && (
            <p className="text-gray-400 text-sm">No individuals available</p>
          )}
          
          {/* Add Individual Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsIndividualFormOpen(true)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Individual
          </Button>
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
            Add Tag
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          {...form.register('summary')}
          placeholder="Enter conversation summary"
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