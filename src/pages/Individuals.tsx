import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFilteredIndividuals, useCRMStore } from '@/store/crmStore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import TagBadge from '@/components/shared/TagBadge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { createColumnHelper } from '@tanstack/react-table';
import { Individual } from '@/types/crm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { IndividualForm } from '@/components/forms/IndividualForm';
import TagFilter from '@/components/shared/TagFilter';
import SearchBar from '@/components/shared/SearchBar';

const columnHelper = createColumnHelper<Individual>();

const Individuals = () => {
  const { companies, deleteIndividual, tags, setSelectedTags, selectedTags, fetchIndividuals } = useCRMStore();
  const individuals = useFilteredIndividuals();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIndividual, setSelectedIndividual] = useState<Individual | null>(null);

  useEffect(() => {
    fetchIndividuals();
  }, [fetchIndividuals]);

  const handleEdit = (individual: Individual) => {
    setSelectedIndividual(individual);
    setIsFormOpen(true);
  };

  const handleDelete = (individual: Individual) => {
    setSelectedIndividual(individual);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedIndividual) {
      await deleteIndividual(selectedIndividual.id);
      setIsDeleteDialogOpen(false);
      setSelectedIndividual(null);
    }
  };

  const columns = [
    columnHelper.accessor('first_name', {
      header: 'Name',
      cell: ({ row }) => {
        const individual = row.original;
        return (
          <Link 
            to={`/individuals/${individual.id}`} 
            className="font-medium text-blue-600 hover:underline"
          >
            {individual.first_name} {individual.last_name}
          </Link>
        );
      },
      size: 250,
    }),
    columnHelper.accessor('company_id', {
      header: 'Company',
      cell: (info) => {
        const companyId = info.getValue();
        if (!companyId) return '-';
        
        const company = companies.find(c => c.id === companyId);
        return company ? (
          <Link to={`/companies/${company.id}`} className="text-blue-600 hover:underline">
            {company.name}
          </Link>
        ) : '-';
      },
      size: 180,
    }),
    columnHelper.accessor('job_title', {
      header: 'Title',
      cell: (info) => info.getValue() || '-',
      size: 150,
    }),
    columnHelper.accessor('tags', {
      header: 'Tags',
      cell: (info) => {
        const tags = info.getValue() || [];
        if (tags.length === 0) return '-';
        
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        );
      },
      size: 200,
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleEdit(info.row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleDelete(info.row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 80,
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
        <Button 
          onClick={() => {
            setSelectedIndividual(null);
            setIsFormOpen(true);
          }}
          className="bg-crm-blue hover:bg-crm-darkBlue"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Individual
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <SearchBar />
        </div>
        <div>
          <TagFilter />
        </div>
      </div>

      <DataTable columns={columns} data={individuals} />

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedIndividual ? 'Edit Individual' : 'Add Individual'}
            </DialogTitle>
            <DialogDescription>
              {selectedIndividual 
                ? 'Edit the individual\'s details below.' 
                : 'Enter the individual\'s details below.'}
            </DialogDescription>
          </DialogHeader>
          <IndividualForm
            initialData={selectedIndividual || undefined}
            onSuccess={() => {
              setIsFormOpen(false);
              setSelectedIndividual(null);
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
              This action cannot be undone. The individual will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <p>
            Are you sure you want to delete {selectedIndividual?.first_name} {selectedIndividual?.last_name}?
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

export default Individuals;
