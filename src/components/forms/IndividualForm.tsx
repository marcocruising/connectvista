import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCRMStore } from '@/store/crmStore';

const individualSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
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
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      title: initialData?.title || '',
      notes: initialData?.notes || '',
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
            {...register('firstName')}
            placeholder="First Name"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <Input
            {...register('lastName')}
            placeholder="Last Name"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
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
          {...register('title')}
          placeholder="Job Title"
        />
      </div>

      <div>
        <Textarea
          {...register('notes')}
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