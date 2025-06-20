import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCRMStore } from '@/store/crmStore';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { companyService } from '@/services/companyService';
import TagBadge from '@/components/shared/TagBadge';
import { Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  website: z.string().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  size: z.enum(['Small', 'Medium', 'Large', 'Enterprise']).nullable().optional(),
  type: z.enum(['Investor', 'Customer', 'Partner', 'Vendor', 'Other']).nullable().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyFormProps {
  initialData?: CompanyFormData & { id?: string; tags?: any[] };
  onSuccess?: (newCompanyId: string) => void;
}

const DEFAULT_BUCKET_ID = '6c83917d-12b8-4f1c-8be5-1b4403e5f5d4'; // TODO: Replace with dynamic bucket selection

export const CompanyForm = ({ initialData, onSuccess }: CompanyFormProps) => {
  const { 
    addCompany, 
    updateCompany, 
    fetchTags, 
    tags,
    updateCompanyWithTags 
  } = useCRMStore();
  
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags?.map(tag => tag.id) || []
  );

  // Track which optional fields are visible
  const [visibleFields, setVisibleFields] = useState<string[]>(
    initialData ? 
      // Show fields that already have data
      [
        ...(initialData.website ? ['website'] : []),
        ...(initialData.description ? ['description'] : []),
        ...(initialData.industry ? ['industry'] : []),
        ...(initialData.size ? ['size'] : []),
        ...(initialData.type ? ['type'] : [])
      ] : []
  );

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || '',
      website: initialData?.website || undefined,
      description: initialData?.description || undefined,
      industry: initialData?.industry || undefined,
      size: initialData?.size || undefined,
      type: initialData?.type || undefined,
    },
  });

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      let companyId: string;
      // Ensure name is always present
      const companyData = { ...data, name: data.name || '' };
      if (initialData?.id) {
        const updatedCompany = await updateCompany(initialData.id, companyData);
        companyId = updatedCompany.id;
        await companyService.updateCompanyTags(companyId, selectedTagIds, DEFAULT_BUCKET_ID);
        await updateCompanyWithTags(companyId, selectedTagIds, DEFAULT_BUCKET_ID);
      } else {
        const newCompany = await addCompany(companyData);
        companyId = newCompany.id;
        await companyService.updateCompanyTags(companyId, selectedTagIds, DEFAULT_BUCKET_ID);
        await updateCompanyWithTags(companyId, selectedTagIds, DEFAULT_BUCKET_ID);
      }
      onSuccess?.(companyId);
    } catch (error) {
      console.error('Failed to save company:', error);
    }
  };

  const handleTagSelection = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  // Available optional fields that can be added - removing size and type
  const availableOptionalFields = useMemo(() => {
    const allOptionalFields = [
      { id: 'website', label: 'Website' },
      { id: 'description', label: 'Description' },
      { id: 'industry', label: 'Industry' },
      // Removed size and type fields
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
      {/* Required Fields Section */}
      <div className="space-y-4">
        <div>
          <Input
            {...register('name')}
            placeholder="Company Name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Tags section - already without border and label as requested previously */}
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
          
          {visibleFields.includes('website') && (
            <div className="relative">
              <Input
                {...register('website')}
                placeholder="Website"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 text-gray-500 hover:text-gray-800"
                onClick={() => removeField('website')}
              >
                Remove
              </Button>
            </div>
          )}

          {visibleFields.includes('description') && (
            <div className="relative">
              <Textarea
                {...register('description')}
                placeholder="Description"
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

          {visibleFields.includes('industry') && (
            <div className="relative">
              <Input
                {...register('industry')}
                placeholder="Industry"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 text-gray-500 hover:text-gray-800"
                onClick={() => removeField('industry')}
              >
                Remove
              </Button>
            </div>
          )}

          {/* Removed the size and type field sections */}
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
        {initialData?.id ? 'Save Changes' : 'Add Company'}
      </Button>
    </div>
  );
}; 