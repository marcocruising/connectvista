
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFilteredIndividuals, useCRMStore } from '@/store/crmStore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import TagBadge from '@/components/shared/TagBadge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { Individual } from '@/types/crm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckIcon, XIcon } from 'lucide-react';

const columnHelper = createColumnHelper<Individual>();

const Individuals = () => {
  const { companies, deleteIndividual, tags, setSelectedTags, selectedTags } = useCRMStore();
  const individuals = useFilteredIndividuals();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [individualToDelete, setIndividualToDelete] = useState<string | null>(null);

  const handleTagSelection = (tagId: string) => {
    setSelectedTags(
      selectedTags.includes(tagId)
        ? selectedTags.filter((id) => id !== tagId)
        : [...selectedTags, tagId]
    );
  };

  const confirmDelete = (id: string) => {
    setIndividualToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = () => {
    if (individualToDelete) {
      deleteIndividual(individualToDelete);
      setIndividualToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const columns = [
    columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
      id: 'name',
      header: 'Name',
      cell: (info) => (
        <Link to={`/individuals/${info.row.original.id}`} className="font-medium text-crm-blue">
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => <a href={`mailto:${info.getValue()}`} className="text-crm-blue">{info.getValue()}</a>,
    }),
    columnHelper.accessor('companyId', {
      header: 'Company',
      cell: (info) => {
        const companyId = info.getValue();
        if (!companyId) return 'N/A';
        const company = companies.find((c) => c.id === companyId);
        return company ? (
          <Link to={`/companies/${companyId}`} className="text-crm-blue">
            {company.name}
          </Link>
        ) : 'Unknown';
      },
    }),
    columnHelper.accessor('tags', {
      header: 'Tags',
      cell: (info) => (
        <div className="flex flex-wrap gap-1">
          {info.getValue().map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/individuals/${info.row.original.id}`} className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => confirmDelete(info.row.original.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-crm-text">Individuals</h1>
          <p className="text-gray-500 mt-1">
            Manage your stakeholders
          </p>
        </div>
        <Button asChild className="bg-crm-blue hover:bg-crm-darkBlue">
          <Link to="/individuals/new" className="flex items-center">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Individual
          </Link>
        </Button>
      </div>

      <div className="bg-white p-4 rounded-md border">
        <h2 className="font-semibold mb-2">Filter by Tags</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Button
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? "default" : "outline"}
              size="sm"
              onClick={() => handleTagSelection(tag.id)}
              style={{
                backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                borderColor: tag.color,
                color: selectedTags.includes(tag.id) ? 'white' : tag.color,
              }}
            >
              {tag.name}
            </Button>
          ))}
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTags([])}
              className="text-gray-500"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={individuals} />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this individual? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              <XIcon className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button variant="destructive" onClick={executeDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Individuals;
