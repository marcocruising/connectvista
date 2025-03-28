
import React, { useState } from 'react';
import { useCRMStore } from '@/store/crmStore';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag } from '@/types/crm';

const Tags = () => {
  const { tags, addTag, updateTag, deleteTag } = useCRMStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3B82F6');

  const openAddDialog = () => {
    setFormMode('add');
    setTagName('');
    setTagColor('#3B82F6');
    setIsOpen(true);
  };

  const openEditDialog = (tag: Tag) => {
    setFormMode('edit');
    setTagToEdit(tag);
    setTagName(tag.name);
    setTagColor(tag.color);
    setIsOpen(true);
  };

  const confirmDelete = (id: string) => {
    setTagToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = () => {
    if (tagToDelete) {
      deleteTag(tagToDelete);
      setTagToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formMode === 'add') {
      addTag({ name: tagName, color: tagColor });
    } else if (formMode === 'edit' && tagToEdit) {
      updateTag(tagToEdit.id, { name: tagName, color: tagColor });
    }
    
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-crm-text">Tags</h1>
          <p className="text-gray-500 mt-1">
            Manage tags to categorize your stakeholders
          </p>
        </div>
        <Button onClick={openAddDialog} className="bg-crm-blue hover:bg-crm-darkBlue">
          <Plus className="mr-2 h-5 w-5" />
          Add Tag
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map((tag) => (
          <div 
            key={tag.id}
            className="flex items-center justify-between bg-white p-4 rounded-lg border"
          >
            <div className="flex items-center">
              <div
                className="w-6 h-6 rounded-full mr-3"
                style={{ backgroundColor: tag.color }}
              />
              <span className="font-medium">{tag.name}</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={() => openEditDialog(tag)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => confirmDelete(tag.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Tag Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === 'add' ? 'Add New Tag' : 'Edit Tag'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tag Name</Label>
                <Input
                  id="name"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Enter tag name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Tag Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="color"
                    type="color"
                    value={tagColor}
                    onChange={(e) => setTagColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={tagColor}
                    onChange={(e) => setTagColor(e.target.value)}
                    placeholder="#HEX"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-crm-blue hover:bg-crm-darkBlue">
                {formMode === 'add' ? 'Add Tag' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this tag? It will be removed from all individuals.</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={executeDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tags;
