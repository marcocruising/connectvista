import React, { useEffect, useState } from 'react';
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

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  website: z.string().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  size: z.enum(['', 'Small', 'Medium', 'Large', 'Enterprise'])
       .transform(val => val === '' ? null : val)
       .nullable()
       .optional(),
  type: z.enum(['', 'Investor', 'Customer', 'Partner', 'Vendor', 'Other'])
       .transform(val => val === '' ? null : val)
       .nullable()
       .optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

type CompanyFormProps = {
  initialData?: any;
  onSuccess?: () => void;
};

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
  
  const companyTypes = [
    { value: 'Investor', label: 'Investor' },
    { value: 'Customer', label: 'Customer' },
    { value: 'Partner', label: 'Partner' },
    { value: 'Vendor', label: 'Vendor' },
    { value: 'Other', label: 'Other' },
  ];

  const companySizes = [
    { value: 'Small', label: 'Small' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Large', label: 'Large' },
    { value: 'Enterprise', label: 'Enterprise' },
  ];

  // Initialize the form with react-hook-form
  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || '',
      website: initialData?.website || '',
      description: initialData?.description || '',
      industry: initialData?.industry || '',
      size: initialData?.size || '',
      type: initialData?.type || '',
    },
  });

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      console.log('Form data:', data);
      console.log('Selected tags:', selectedTagIds);
      
      // Process the data to handle empty strings properly
      const basicData = {
        ...data,
        // Convert empty strings to null
        size: data.size === '' ? null : data.size,
        type: data.type === '' ? null : data.type
      };
      
      if (initialData?.id) {
        await updateCompany(initialData.id, basicData);
        // After successful update, handle tags separately
        await companyService.updateCompanyTags(initialData.id, selectedTagIds);
        // Update the store with the tags
        await updateCompanyWithTags(initialData.id, selectedTagIds);
      } else {
        // For new companies, we need to ensure name is provided
        if (!basicData.name) {
          throw new Error('Company name is required');
        }
        
        const newCompany = await addCompany(basicData);
        // After successful creation, handle tags separately
        if (newCompany?.id) {
          await companyService.updateCompanyTags(newCompany.id, selectedTagIds);
          // Update the store with the tags
          await updateCompanyWithTags(newCompany.id, selectedTagIds);
        }
      }
      onSuccess?.();
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Company Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Website" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Description" rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Industry" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <select
                  className="w-full p-2 border rounded"
                  {...field}
                  onChange={e => field.onChange(e.target.value)}
                >
                  <option value="">Select Size</option>
                  {companySizes.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <select
                  className="w-full p-2 border rounded"
                  {...field}
                  onChange={e => field.onChange(e.target.value)}
                >
                  <option value="">Select Type</option>
                  {companyTypes.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tag selection section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>

        <Button type="submit" className="w-full">
          {initialData ? 'Update Company' : 'Create Company'}
        </Button>
      </form>
    </Form>
  );
}; 