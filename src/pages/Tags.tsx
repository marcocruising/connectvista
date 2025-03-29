import React, { useState, useEffect } from 'react';
import { useCRMStore } from '@/store/crmStore';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tag } from '@/types/crm';
import { TagForm } from '@/components/forms/TagForm';
import { DataTable } from '@/components/shared/DataTable';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<Tag>();

const Tags = () => {
  const { tags, fetchTags, deleteTag } = useCRMStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setIsFormOpen(true);
  };

  const handleDelete = (tag: Tag) => {
    setSelectedTag(tag);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedTag) {
      await deleteTag(selectedTag.id);
      setIsDeleteDialogOpen(false);
      setSelectedTag(null);
    }
  };

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded mr-2"
            style={{ backgroundColor: info.row.original.color }}
          />
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('color', {
      header: 'Color',
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(info.row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(info.row.original)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-crm-text">Tags</h1>
          <p className="text-gray-500 mt-1">
            Manage tags to categorize your contacts and companies
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedTag(null);
            setIsFormOpen(true);
          }}
          className="bg-crm-blue hover:bg-crm-darkBlue"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Tag
        </Button>
      </div>

      <DataTable columns={columns} data={tags} />

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTag ? 'Edit Tag' : 'Add Tag'}</DialogTitle>
            <DialogDescription>
              {selectedTag 
                ? 'Edit the tag details below.' 
                : 'Create a new tag by filling out the form below.'}
            </DialogDescription>
          </DialogHeader>
          <TagForm
            initialData={selectedTag || undefined}
            onSuccess={() => {
              setIsFormOpen(false);
              setSelectedTag(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The tag will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <p>
            Are you sure you want to delete the tag "{selectedTag?.name}"?
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tags;
