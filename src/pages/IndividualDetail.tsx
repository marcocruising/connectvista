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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Edit, Trash2, Building, Phone, Mail, Calendar, MessageCircle, Briefcase, FileText } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import TagBadge from '@/components/shared/TagBadge';
import { IndividualForm } from '@/components/forms/IndividualForm';
import ConversationTimeline from '@/components/shared/ConversationTimeline';
import { ConversationForm } from '@/components/forms/ConversationForm';
import { Conversation } from '@/types/crm';

const IndividualDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    individuals, 
    companies, 
    conversations, 
    fetchIndividuals, 
    fetchCompanies, 
    fetchConversations,
    deleteIndividual,
    currentBucketId,
    isAuthenticated
  } = useCRMStore();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isConversationFormOpen, setIsConversationFormOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    if (isAuthenticated && currentBucketId && id) {
      fetchCompanies(currentBucketId);
      fetchConversations(currentBucketId);
      fetchIndividuals(currentBucketId);
      console.log("IndividualDetail - Loading data for individual:", id);
    }
  }, [fetchCompanies, fetchConversations, fetchIndividuals, isAuthenticated, currentBucketId, id]);

  const individual = individuals.find(i => i.id === id);
  
  // Find associated company
  const company = individual?.company_id ? companies.find(c => c.id === individual.company_id) : null;
  
  // Get related conversations
  const individualConversations = conversations.filter(c => {
    const matches = c.individualIds && c.individualIds.includes(id!);
    console.log(`Conversation ${c.id} (${c.title}) individual match for ${id}: ${matches}`, 
      c.individualIds);
    return matches;
  });

  console.log("Individual conversations found:", individualConversations.length, individualConversations);

  const handleEditConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsConversationFormOpen(true);
  };

  if (!individual) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Individual not found</h1>
          <p className="mb-6">The contact you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/individuals')}>
            Back to Individuals
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteIndividual(id!);
    navigate('/individuals');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{individual.first_name} {individual.last_name}</h1>
            {individual.tags && individual.tags.length > 0 && (
              <div className="flex gap-2 ml-2">
                {individual.tags.map(tag => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">Added on {format(new Date(individual.created_at), 'MMMM d, yyyy')}</p>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversations">Conversations ({individualConversations.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>Contact information and details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {company && (
                    <div className="flex items-center">
                      <Building className="h-5 w-5 mr-2 text-gray-500" />
                      <Link to={`/companies/${company.id}`} className="text-blue-600 hover:underline">
                        {company.name}
                      </Link>
                    </div>
                  )}
                  
                  {individual.role && (
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-gray-500" />
                      <span>{individual.role}</span>
                    </div>
                  )}
                  
                  {individual.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-gray-500" />
                      <a href={`mailto:${individual.email}`} className="text-blue-600 hover:underline">
                        {individual.email}
                      </a>
                    </div>
                  )}
                  
                  {individual.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-gray-500" />
                      <span>{individual.phone}</span>
                    </div>
                  )}
                  
                  {individual.description && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Notes</h3>
                      <p className="text-gray-700">{individual.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Contact activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2 text-gray-500" />
                      <span>Conversations</span>
                    </div>
                    <span className="font-bold">{individualConversations.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                      <span>Last Contact</span>
                    </div>
                    <span className="font-bold">
                      {individualConversations.length > 0 
                        ? format(new Date(individualConversations[0].date), 'MMM d, yyyy')
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="conversations" className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-xl font-medium">Conversation History</h3>
            <Button 
              onClick={() => {
                setSelectedConversation(null);
                setIsConversationFormOpen(true);
              }}
              size="sm"
            >
              Add Conversation
            </Button>
          </div>
          
          {individualConversations.length === 0 ? (
            <p className="text-sm text-gray-500">No conversations recorded yet.</p>
          ) : (
            <ConversationTimeline 
              conversations={individualConversations}
              onEditConversation={handleEditConversation}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update the contact details below.
            </DialogDescription>
          </DialogHeader>
          <IndividualForm 
            initialData={individual} 
            onSuccess={() => setIsEditDialogOpen(false)} 
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
              Are you sure you want to delete {individual.first_name} {individual.last_name}? This action cannot be undone.
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

      <Dialog open={isConversationFormOpen} onOpenChange={setIsConversationFormOpen}>
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
            initialIndividualIds={[individual?.id].filter(Boolean) as string[]}
            initialCompanyId={individual?.company_id}
            onSuccess={() => {
              setIsConversationFormOpen(false);
              setSelectedConversation(null);
              fetchConversations(currentBucketId); // Refresh conversations
            }}
            bucketId={currentBucketId}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IndividualDetail; 