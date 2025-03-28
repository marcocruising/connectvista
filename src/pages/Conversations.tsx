
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFilteredConversations, useCRMStore } from '@/store/crmStore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Calendar } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { Conversation } from '@/types/crm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { XIcon } from 'lucide-react';
import { format } from 'date-fns';

const columnHelper = createColumnHelper<Conversation>();

const Conversations = () => {
  const { companies, individuals, deleteConversation } = useCRMStore();
  const conversations = useFilteredConversations();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    setConversationToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = () => {
    if (conversationToDelete) {
      deleteConversation(conversationToDelete);
      setConversationToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const getParticipantNames = (conversation: Conversation) => {
    const participantIndividuals = individuals
      .filter(individual => conversation.individualIds.includes(individual.id))
      .map(individual => `${individual.firstName} ${individual.lastName}`);
    
    if (conversation.companyId) {
      const company = companies.find(c => c.id === conversation.companyId);
      if (company) {
        if (participantIndividuals.length > 0) {
          return `${participantIndividuals.join(', ')} (${company.name})`;
        }
        return company.name;
      }
    }
    
    return participantIndividuals.join(', ') || 'Unknown';
  };

  const columns = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => (
        <Link to={`/conversations/${info.row.original.id}`} className="font-medium text-crm-blue">
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('date', {
      header: 'Date',
      cell: (info) => (
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
          {format(new Date(info.getValue()), 'PPP')}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'participants',
      header: 'Participants',
      cell: (info) => getParticipantNames(info.row.original),
    }),
    columnHelper.accessor('nextSteps', {
      header: 'Next Steps',
      cell: (info) => {
        const value = info.getValue();
        return value.length > 50 ? `${value.substring(0, 50)}...` : value;
      },
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
              <Link to={`/conversations/${info.row.original.id}`} className="flex items-center">
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
          <h1 className="text-3xl font-bold text-crm-text">Conversations</h1>
          <p className="text-gray-500 mt-1">
            Track all your stakeholder communications
          </p>
        </div>
        <Button asChild className="bg-crm-blue hover:bg-crm-darkBlue">
          <Link to="/conversations/new" className="flex items-center">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Conversation
          </Link>
        </Button>
      </div>

      <DataTable columns={columns} data={conversations} />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this conversation? This action cannot be undone.</p>
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

export default Conversations;
