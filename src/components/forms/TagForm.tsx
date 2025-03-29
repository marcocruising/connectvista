import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCRMStore } from '@/store/crmStore';

const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  color: z.string().min(1, 'Color is required'),
});

type TagFormData = z.infer<typeof tagSchema>;

interface TagFormProps {
  initialData?: { id: string; name: string; color: string };
  onSuccess?: () => void;
}

export const TagForm = ({ initialData, onSuccess }: TagFormProps) => {
  const { addTag, updateTag } = useCRMStore();
  const { register, handleSubmit, formState: { errors } } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: initialData?.name || '',
      color: initialData?.color || '#3B82F6',
    },
  });

  const onSubmit = async (data: TagFormData) => {
    try {
      if (initialData?.id) {
        await updateTag(initialData.id, data);
      } else {
        await addTag(data);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save tag:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('name')}
          placeholder="Tag Name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Input
          {...register('color')}
          type="color"
          className="h-10 w-full"
        />
        {errors.color && (
          <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        {initialData?.id ? 'Save Changes' : 'Add Tag'}
      </Button>
    </form>
  );
}; 