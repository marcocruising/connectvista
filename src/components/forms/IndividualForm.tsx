import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { PlusCircle, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CompanyForm } from '@/components/forms/CompanyForm';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  bucketId: string;
}

export const IndividualForm = ({ initialData, initialCompanyId, onSuccess, bucketId }: IndividualFormProps) => {
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

  // Track which optional fields are visible
  const [visibleFields, setVisibleFields] = useState<string[]>(
    initialData ? 
      // Show fields that already have data
      [
        ...(initialData.email ? ['email'] : []),
        ...(initialData.phone ? ['phone'] : []),
        ...(initialData.role ? ['role'] : []),
        ...(initialData.description ? ['description'] : [])
      ] : []
  );

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
      let individualId: string;
      
      if (initialData?.id) {
        // Update existing individual
        const updatedIndividual = await updateIndividual(initialData.id, data);
        individualId = updatedIndividual.id;
        // Update individual tags
        await updateIndividualWithTags(individualId, selectedTagIds);
      } else {
        // Create new individual
        const newIndividual = await addIndividual({
          ...data,
          first_name: data.first_name || '',
          last_name: data.last_name || ''
        }, bucketId);
        individualId = newIndividual.id;
        // Add individual tags
        await updateIndividualWithTags(individualId, selectedTagIds);
      }
      
      onSuccess?.(individualId);
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

  // Available optional fields that can be added
  const availableOptionalFields = useMemo(() => {
    const allOptionalFields = [
      { id: 'email', label: 'Email' },
      { id: 'phone', label: 'Phone Number' },
      { id: 'role', label: 'Job Title' },
      { id: 'description', label: 'Notes' },
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
    setValue(fieldId as any, '');
  }, [setValue]);

  return (
    <div className="space-y-4">
      {/* Required/Core fields section */}
      <div className="space-y-4">
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

        {/* Company field - changing "None" to "Select company" */}
        <div className="space-y-2">
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

        {/* Tags - removing label and border */}
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {tags.length > 0 ? (
            tags.map((tag) => (
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
            ))
          ) : (
            <p className="text-gray-400 text-sm">No tags available</p>
          )}
        </div>
      </div>
      
      {/* Optional fields section */}
      {visibleFields.length > 0 && (
        <div className="border-t pt-4 mt-4 space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Optional Information</h4>
          
          {visibleFields.includes('email') && (
            <div className="relative">
              <Input
                {...register('email')}
                type="email"
                placeholder="Email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 text-gray-500 hover:text-gray-800"
                onClick={() => removeField('email')}
              >
                Remove
              </Button>
            </div>
          )}

          {visibleFields.includes('phone') && (
            <div className="relative">
              <Input
                {...register('phone')}
                placeholder="Phone"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 text-gray-500 hover:text-gray-800"
                onClick={() => removeField('phone')}
              >
                Remove
              </Button>
            </div>
          )}

          {visibleFields.includes('role') && (
            <div className="relative">
              <Input
                {...register('role')}
                placeholder="Job Title"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 text-gray-500 hover:text-gray-800"
                onClick={() => removeField('role')}
              >
                Remove
              </Button>
            </div>
          )}

          {visibleFields.includes('description') && (
            <div className="relative">
              <Textarea
                {...register('description')}
                placeholder="Notes"
                rows={4}
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 top-3 h-6 text-gray-500 hover:text-gray-800"
                onClick={() => removeField('description')}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add optional field dropdown */}
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
        onClick={handleSubmit(onSubmit)}
      >
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
          <CompanyForm onSuccess={handleCompanyCreated} />
        </DialogContent>
      </Dialog>
    </div>
  );
}; 