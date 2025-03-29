import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCRMStore } from '@/store/crmStore';

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  website: z.string().optional(),
  description: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyFormProps {
  initialData?: Partial<CompanyFormData> & { id?: string };
  onSuccess?: () => void;
}

export const CompanyForm = ({ initialData, onSuccess }: CompanyFormProps) => {
  const { addCompany, updateCompany } = useCRMStore();
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || '',
      website: initialData?.website || '',
      description: initialData?.description || '',
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    try {
      if (initialData?.id) {
        await updateCompany(initialData.id, data);
      } else {
        await addCompany(data);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save company:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('name')}
          placeholder="Company Name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Input
          {...register('website')}
          placeholder="Website"
        />
      </div>

      <div>
        <Textarea
          {...register('description')}
          placeholder="Description"
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full">
        {initialData?.id ? 'Save Changes' : 'Add Company'}
      </Button>
    </form>
  );
}; 