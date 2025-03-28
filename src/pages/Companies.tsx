
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFilteredCompanies, useCRMStore } from '@/store/crmStore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { Company } from '@/types/crm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckIcon, XIcon } from 'lucide-react';

const columnHelper = createColumnHelper<Company>();

const Companies = () => {
  const { deleteCompany } = useCRMStore();
  const companies = useFilteredCompanies();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    setCompanyToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = () => {
    if (companyToDelete) {
      deleteCompany(companyToDelete);
      setCompanyToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <Link to={`/companies/${info.row.original.id}`} className="font-medium text-crm-blue">
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('industry', {
      header: 'Industry',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('website', {
      header: 'Website',
      cell: (info) => (
        <a href={info.getValue()} target="_blank" rel="noopener noreferrer" className="text-crm-blue">
          {info.getValue().replace(/^https?:\/\//, '')}
        </a>
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
              <Link to={`/companies/${info.row.original.id}`} className="flex items-center">
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
          <h1 className="text-3xl font-bold text-crm-text">Companies</h1>
          <p className="text-gray-500 mt-1">
            Manage your company relationships
          </p>
        </div>
        <Button asChild className="bg-crm-blue hover:bg-crm-darkBlue">
          <Link to="/companies/new" className="flex items-center">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Company
          </Link>
        </Button>
      </div>

      <DataTable columns={columns} data={companies} />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this company? This action cannot be undone.</p>
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

export default Companies;
