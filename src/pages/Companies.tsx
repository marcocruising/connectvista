import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilteredCompanies, useCRMStore } from '@/store/crmStore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { createColumnHelper } from '@tanstack/react-table';
import { Company } from '@/types/crm';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { CompanyForm } from '@/components/forms/CompanyForm';
import TagBadge from '@/components/shared/TagBadge';

const columnHelper = createColumnHelper<Company>();

const Companies = () => {
  const navigate = useNavigate();
  const { fetchCompanies, deleteCompany } = useCRMStore();
  const companies = useFilteredCompanies();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedCompany) {
      await deleteCompany(selectedCompany.id);
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
    }
  };

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('website', {
      header: 'Website',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('tags', {
      header: 'Tags',
      cell: (info) => {
        const tags = info.getValue() || [];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        );
      },
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('industry', {
      header: 'Industry',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('size', {
      header: 'Size',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(info.row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDelete(info.row.original)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
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
          <h1 className="text-3xl font-bold text-crm-text">Companies</h1>
          <p className="text-gray-500 mt-1">
            Manage your company relationships
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedCompany(null);
            setIsEditDialogOpen(true);
          }} 
          className="bg-crm-blue hover:bg-crm-darkBlue"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Company
        </Button>
      </div>

      <DataTable columns={columns} data={companies} />

      {/* Edit/Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCompany ? 'Edit Company' : 'Add Company'}
            </DialogTitle>
            <DialogDescription>
              {selectedCompany 
                ? 'Update the company details below.' 
                : 'Enter new company details below.'}
            </DialogDescription>
          </DialogHeader>
          <CompanyForm 
            initialData={selectedCompany || undefined}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setSelectedCompany(null);
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
              Are you sure you want to delete {selectedCompany?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
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

export default Companies;
