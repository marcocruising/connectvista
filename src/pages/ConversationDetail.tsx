import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCRMStore } from '@/store/crmStore';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { format } from 'date-fns';
import { Edit, Trash2, Building, Calendar, Users, FileText } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import TagBadge from '@/components/shared/TagBadge';
import { ConversationForm } from '@/components/forms/ConversationForm';

const ConversationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    conversations, 
    companies, 
    individuals, 
    fetchConversations, 
    fetchCompanies, 
    fetchIndividuals,
    deleteConversation
  } = useCRMStore();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
    fetchCompanies();
    fetchIndividuals();
  }, [fetchConversations, fetchCompanies, fetchIndividuals]);

  const conversation = conversations.find(c => c.id === id);
  
  // Get associated company
  const company = conversation?.companyId 
    ? companies.find(c => c.id === conversation.companyId) 
    : null;
  
  // Get associated individuals
  const conversationIndividuals = individuals.filter(i => 
    conversation?.individualIds?.includes(i.id)
  );

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Conversation not found</h1>
          <p className="mb-6">The conversation you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/conversations')}>
            Back to Conversations
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteConversation(id!);
    navigate('/conversations');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{conversation.title}</h1>
            {conversation.tags && conversation.tags.length > 0 && (
              <div className="flex gap-2 ml-2">
                {conversation.tags.map(tag => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(conversation.date), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              Details of this conversation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{conversation.summary}</p>
              </div>
              
              {conversation.nextSteps && (
                <div>
                  <h3 className="font-medium mb-2 text-gray-900">Next Steps</h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-700">{conversation.nextSteps}</p>
                  </div>
                </div>
              )}
              
              {conversation.notes && (
                <div>
                  <h3 className="font-medium mb-2 text-gray-900">Notes</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{conversation.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>Information about this conversation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{format(new Date(conversation.date), 'MMMM d, yyyy')}</span>
                </div>
                
                {company && (
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-gray-500" />
                    <Link to={`/companies/${company.id}`} className="text-blue-600 hover:underline">
                      {company.name}
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
              <CardDescription>People involved in this conversation</CardDescription>
            </CardHeader>
            <CardContent>
              {conversationIndividuals.length === 0 ? (
                <p className="text-gray-500">No participants recorded.</p>
              ) : (
                <div className="space-y-3">
                  {conversationIndividuals.map(individual => (
                    <div key={individual.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-gray-500" />
                        <Link to={`/individuals/${individual.id}`} className="text-blue-600 hover:underline">
                          {individual.first_name} {individual.last_name}
                        </Link>
                      </div>
                      {individual.role && (
                        <span className="text-sm text-gray-500">{individual.role}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {conversation.tags && conversation.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Categories for this conversation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {conversation.tags.map(tag => (
                    <TagBadge key={tag.id} tag={tag} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Conversation</DialogTitle>
            <DialogDescription>
              Update the conversation details below.
            </DialogDescription>
          </DialogHeader>
          <ConversationForm 
            initialData={conversation} 
            onSuccess={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConversationDetail; 