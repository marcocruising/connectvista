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
import { Edit, Trash2, Building, Globe, Phone, Mail, Calendar, MessageCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import TagBadge from '@/components/shared/TagBadge';
import { CompanyForm } from '@/components/forms/CompanyForm';
import ConversationTimeline from '@/components/shared/ConversationTimeline';
import { ConversationForm } from '@/components/forms/ConversationForm';

const CompanyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    companies, 
    individuals, 
    conversations, 
    fetchCompanies, 
    fetchIndividuals, 
    fetchConversations,
    deleteCompany
  } = useCRMStore();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isConversationFormOpen, setIsConversationFormOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    fetchCompanies();
    fetchIndividuals();
    fetchConversations();
    
    console.log("CompanyDetail - Loading data for company:", id);
  }, [fetchCompanies, fetchIndividuals, fetchConversations, id]);

  const company = companies.find(c => c.id === id);
  
  // Get related individuals (employees)
  const companyIndividuals = individuals.filter(i => i.company_id === id);
  
  // Get related conversations
  const companyConversations = conversations.filter(c => {
    const matches = c.companyId === id;
    console.log(`Conversation ${c.id} (${c.title}) company match for ${id}: ${matches}`, c);
    return matches;
  });

  console.log("Company conversations found:", companyConversations.length, companyConversations);

  if (!company) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Company not found</h1>
          <p className="mb-6">The company you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/companies')}>
            Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteCompany(id!);
    navigate('/companies');
  };

  const handleEditConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsConversationFormOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{company.name}</h1>
            {company.tags && company.tags.length > 0 && (
              <div className="flex gap-2 ml-2">
                {company.tags.map(tag => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">Added on {format(new Date(company.created_at), 'MMMM d, yyyy')}</p>
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
          <TabsTrigger value="people">People ({companyIndividuals.length})</TabsTrigger>
          <TabsTrigger value="conversations">Conversations ({companyConversations.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>Company information and details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {company.website && (
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-gray-500" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {company.website}
                      </a>
                    </div>
                  )}
                  
                  {company.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-gray-500" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  
                  {company.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-gray-500" />
                      <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                        {company.email}
                      </a>
                    </div>
                  )}
                  
                  {company.description && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Description</h3>
                      <p className="text-gray-700">{company.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Company activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building className="h-5 w-5 mr-2 text-gray-500" />
                      <span>Employees</span>
                    </div>
                    <span className="font-bold">{companyIndividuals.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2 text-gray-500" />
                      <span>Conversations</span>
                    </div>
                    <span className="font-bold">{companyConversations.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                      <span>Last Contact</span>
                    </div>
                    <span className="font-bold">
                      {companyConversations.length > 0 
                        ? format(new Date(companyConversations[0].date), 'MMM d, yyyy')
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="people">
          <Card>
            <CardHeader>
              <CardTitle>Company Employees</CardTitle>
              <CardDescription>People associated with {company.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {companyIndividuals.length === 0 ? (
                <p className="text-gray-500">No employees found for this company.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companyIndividuals.map(individual => (
                    <div key={individual.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link to={`/individuals/${individual.id}`} className="font-medium hover:text-blue-600">
                            {individual.first_name} {individual.last_name}
                          </Link>
                          {individual.role && <p className="text-gray-500 text-sm">{individual.role}</p>}
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        {individual.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1 text-gray-500" />
                            <a href={`mailto:${individual.email}`} className="text-sm text-blue-600 hover:underline">
                              {individual.email}
                            </a>
                          </div>
                        )}
                        {individual.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="text-sm">{individual.phone}</span>
                          </div>
                        )}
                      </div>
                      {individual.tags && individual.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {individual.tags.map(tag => (
                            <TagBadge key={tag.id} tag={tag} size="sm" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conversations" className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-xl font-medium">Conversations</h3>
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
          
          {companyConversations.length === 0 ? (
            <p className="text-sm text-gray-500">No conversations recorded yet.</p>
          ) : (
            <ConversationTimeline 
              conversations={companyConversations}
              onEditConversation={handleEditConversation}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update the company details below.
            </DialogDescription>
          </DialogHeader>
          <CompanyForm 
            initialData={company} 
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
              Are you sure you want to delete {company.name}? This action cannot be undone and will remove all data associated with this company.
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
            initialCompanyId={company?.id}
            onSuccess={() => {
              setIsConversationFormOpen(false);
              setSelectedConversation(null);
              fetchConversations(); // Refresh conversations
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyDetail; 