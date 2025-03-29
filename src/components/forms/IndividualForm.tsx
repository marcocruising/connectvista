import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCRMStore } from '@/store/crmStore';

const individualSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.string().optional(),
  description: z.string().optional(),
});

type IndividualFormData = z.infer<typeof individualSchema>;

interface IndividualFormProps {
  initialData?: IndividualFormData & { id?: string };
  onSuccess?: () => void;
}

export const IndividualForm = ({ initialData, onSuccess }: IndividualFormProps) => {
  const { addIndividual, updateIndividual } = useCRMStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<IndividualFormData>({
    resolver: zodResolver(individualSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      role: initialData?.role || '',
      description: initialData?.description || '',
    },
  });

  const onSubmit = async (data: IndividualFormData) => {
    try {
      if (initialData?.id) {
        await updateIndividual(initialData.id, data);
      } else {
        await addIndividual(data);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save individual:', error);
    }
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

      <div>
        <Input
          {...register('role')}
          placeholder="Job Title"
        />
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
    </form>
  );
}; 