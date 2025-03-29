import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCRMStore } from '@/store/crmStore';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import TagBadge from '@/components/shared/TagBadge';
import { individualService } from '@/services/individualService';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CompanyForm } from '@/components/forms/CompanyForm';

const individualSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company_id: z.string().uuid().nullable().optional(),
  role: z.string().optional(),
  description: z.string().optional(),
});

type IndividualFormData = z.infer<typeof individualSchema>;

interface IndividualFormProps {
  initialData?: IndividualFormData & { id?: string; tags?: any[] };
  initialCompanyId?: string;
  onSuccess?: (newIndividualId: string) => void;
}

export const IndividualForm = ({ initialData, initialCompanyId, onSuccess }: IndividualFormProps) => {
  const { 
    addIndividual, 
    updateIndividual, 
    fetchCompanies, 
    companies, 
    fetchTags, 
    tags,
    updateIndividualWithTags 
  } = useCRMStore();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags?.map(tag => tag.id) || []
  );
  
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(
    initialData?.company_id || initialCompanyId
  );

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<IndividualFormData>({
    resolver: zodResolver(individualSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      company_id: initialData?.company_id || initialCompanyId || undefined,
      role: initialData?.role || '',
      description: initialData?.description || '',
    },
  });

  const selectedCompanyIdWatch = watch('company_id') || 'none';

  useEffect(() => {
    fetchCompanies();
    fetchTags();
  }, [fetchCompanies, fetchTags]);

  const handleCompanyCreated = (newCompanyId: string) => {
    setSelectedCompanyId(newCompanyId);
    setValue('company_id', newCompanyId);
    setIsCompanyFormOpen(false);
  };

  const onSubmit = async (data: IndividualFormData) => {
    try {
      // Log what we're about to submit
      console.log('Form data:', data);
      console.log('Selected tags:', selectedTagIds);
      
      // First, try just saving the individual data without tags
      const basicData = { ...data };
      
      if (initialData?.id) {
        await updateIndividual(initialData.id, basicData);
        // After successful update, handle tags separately
        await individualService.updateIndividualTags(initialData.id, selectedTagIds);
        // Update the store with the tags
        await updateIndividualWithTags(initialData.id, selectedTagIds);
      } else {
        const newIndividual = await addIndividual(basicData);
        // After successful creation, handle tags separately
        if (newIndividual?.id) {
          await individualService.updateIndividualTags(newIndividual.id, selectedTagIds);
          // Update the store with the tags
          await updateIndividualWithTags(newIndividual.id, selectedTagIds);
        }
      }
      onSuccess?.(initialData?.id || newIndividual?.id || '');
    } catch (error) {
      console.error('Failed to save individual:', error);
    }
  };

  const handleCompanyChange = (value: string) => {
    setValue('company_id', value === 'none' ? null : value);
  };

  const handleTagSelection = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            {...register('first_name')}
            placeholder="First Name"
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
          )}
        </div>

        <div>
          <Input
            {...register('last_name')}
            placeholder="Last Name"
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div>
        <Input
          {...register('email')}
          type="email"
          placeholder="Email"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Input
          {...register('phone')}
          placeholder="Phone"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <div className="flex space-x-2 items-center">
          <div className="flex-grow">
            <Select
              value={selectedCompanyIdWatch}
              onValueChange={(value) => {
                const companyId = value === "none" ? undefined : value;
                setSelectedCompanyId(companyId);
                setValue('company_id', companyId);
              }}
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

      <div>
        <Input
          {...register('role')}
          placeholder="Job Title"
        />
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
        </div>
      </div>

      <div>
        <Textarea
          {...register('description')}
          placeholder="Notes"
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full">
        {initialData?.id ? 'Save Changes' : 'Add Individual'}
      </Button>
      
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
    </form>
  );
}; 