import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFilteredConversations, useCRMStore } from '@/store/crmStore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Calendar, MoreHorizontal } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { createColumnHelper } from '@tanstack/react-table';
import { Conversation } from '@/types/crm';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { ConversationForm } from '@/components/forms/ConversationForm';
import TagBadge from '@/components/shared/TagBadge';
import TagFilter from '@/components/shared/TagFilter';
import SearchBar from '@/components/shared/SearchBar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const columnHelper = createColumnHelper<Conversation>();

const Conversations = () => {
  const { fetchConversations, fetchIndividuals, deleteConversation, individuals, companies } = useCRMStore();
  const conversations = useFilteredConversations();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedTags, setSelectedTags } = useCRMStore();

  useEffect(() => {
    fetchConversations();
    fetchIndividuals();
  }, [fetchConversations, fetchIndividuals]);

  const handleEdit = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsFormOpen(true);
  };

  const handleDelete = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedConversation) {
      await deleteConversation(selectedConversation.id);
      setIsDeleteDialogOpen(false);
      setSelectedConversation(null);
    }
  };

  const columns = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: ({ row }) => {
        const conversation = row.original;
        return (
          <Link 
            to={`/conversations/${conversation.id}`} 
            className="font-medium text-blue-600 hover:underline"
          >
            {conversation.title}
          </Link>
        );
      }
    }),
    columnHelper.accessor('date', {
      header: 'Date',
      cell: (info) => format(new Date(info.getValue()), 'MMM d, yyyy'),
    }),
    columnHelper.accessor('companyId', {
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
    }),
    columnHelper.accessor('individualIds', {
      header: 'Participants',
      cell: (info) => {
        const individualIds = info.getValue() || [];
        if (individualIds.length === 0) return '-';
        
        const participantIndividuals = individuals.filter(individual => 
          individualIds.includes(individual.id)
        );
        
        return (
          <div className="participants-container">
            {participantIndividuals.map((individual, index) => (
              <span key={individual.id}>
                <Link 
                  to={`/individuals/${individual.id}`} 
                  className="text-blue-600 hover:underline"
                >
                  {individual.first_name} {individual.last_name}
                </Link>
                {index < participantIndividuals.length - 1 && ', '}
              </span>
            ))}
          </div>
        );
      },
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
    }),
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-crm-text">Conversations</h1>
          <p className="text-gray-500 mt-1">
            Track interactions with your contacts and companies
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedConversation(null);
            setIsFormOpen(true);
          }} 
          className="bg-crm-blue hover:bg-crm-darkBlue"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Log Conversation
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="Search conversations..." 
          />
          <TagFilter />
        </div>
        <Button onClick={() => setIsFormOpen(true)}>Add Conversation</Button>
      </div>

      <DataTable columns={columns} data={conversations} />

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedConversation ? 'Edit Conversation' : 'Log Conversation'}
            </DialogTitle>
            <DialogDescription>
              {selectedConversation 
                ? 'Update conversation details below.' 
                : 'Enter details about the conversation below.'}
            </DialogDescription>
          </DialogHeader>
          <ConversationForm 
            initialData={selectedConversation || undefined}
            onSuccess={() => {
              setIsFormOpen(false);
              setSelectedConversation(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Conversations;
