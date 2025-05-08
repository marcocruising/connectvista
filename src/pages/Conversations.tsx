import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFilteredConversations, useCRMStore, DEFAULT_BUCKET_ID } from '@/store/crmStore';
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
import CreatorFilter from '@/components/shared/CreatorFilter';
import SearchBar from '@/components/shared/SearchBar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';

const columnHelper = createColumnHelper<Conversation>();

const Conversations = () => {
  const { fetchConversations, fetchIndividuals, deleteConversation, individuals, companies } = useCRMStore();
  const conversations = useFilteredConversations();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedTags, setSelectedTags } = useCRMStore();
  const [creatorUsers, setCreatorUsers] = useState<Record<string, any>>({});

  // TODO: Replace this with real bucket selection logic
  const currentBucketId = "REPLACE_WITH_REAL_BUCKET_ID";

  // Memoize the columns to prevent unnecessary re-renders
  const columns = useMemo(() => [
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
      },
      size: 250,
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
    columnHelper.accessor('created_by', {
      header: 'Created By',
      cell: (info) => {
        const creatorId = info.getValue();
        if (!creatorId) return '-';
        
        const displayName = getUserDisplayName(creatorId);
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-purple-200">
                {displayName[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span>{displayName}</span>
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
  ], []); // Empty dependency array since columns don't depend on any props or state

  // Fetch initial data only once
  useEffect(() => {
    fetchConversations();
    fetchIndividuals(DEFAULT_BUCKET_ID);
  }, []); // Empty dependency array since we only want to fetch once

  // Fetch creator info only when conversations change
  useEffect(() => {
    const fetchCreatorInfo = async () => {
      const creatorIds = [...new Set(conversations.map(c => c.created_by).filter(Boolean))];
      const users: Record<string, any> = {};
      
      // Get current user info from session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const currentUser = session.user;
        // Add the current user to our users object
        if (creatorIds.includes(currentUser.id)) {
          users[currentUser.id] = {
            id: currentUser.id,
            email: currentUser.email || '',
            user_metadata: currentUser.user_metadata
          };
        }
      }
      
      // For other users, we can't fetch their data directly, so we'll just display IDs
      creatorIds.forEach(creatorId => {
        if (!users[creatorId]) {
          users[creatorId] = {
            id: creatorId,
            email: ''
          };
        }
      });
      
      setCreatorUsers(users);
    };

    if (conversations.length > 0) {
      fetchCreatorInfo();
    }
  }, [conversations]); // Only re-run when conversations change

  const getUserDisplayName = (creatorId: string) => {
    if (!creatorId) return 'Unknown';
    
    const user = creatorUsers[creatorId];
    if (!user) {
      // Display a shortened UUID if we don't have user info
      return creatorId.substring(0, 8) + '...';
    }
    
    // First try to get the display name from metadata (from Google sign-in)
    if (user.user_metadata?.name) {
      return user.user_metadata.name;
    }
    
    // Then try to get the full name
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    // Then try to get username from email
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    // Fall back to shortened UUID
    return creatorId.substring(0, 8) + '...';
  };

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
          Add Conversation
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <SearchBar 
            placeholder="Search conversations..." 
          />
        </div>
        <div>
          <TagFilter />
        </div>
        <div>
          <CreatorFilter />
        </div>
      </div>

      <DataTable columns={columns} data={conversations} />

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedConversation ? 'Edit Conversation' : 'Add Conversation'}
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
            bucketId={currentBucketId}
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
