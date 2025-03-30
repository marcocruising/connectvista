import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCRMStore } from '@/store/crmStore';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { format } from 'date-fns';
import { Edit, Trash2, Building, Calendar, Users, FileText, Bell, Plus, X, Check } from 'lucide-react';
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { reminderService } from '@/services/reminderService';

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
    deleteConversation,
    markReminderComplete,
    dismissReminder,
    fetchReminders
  } = useCRMStore();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isConversationFormOpen, setIsConversationFormOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
    fetchCompanies();
    fetchIndividuals();
    if (id) {
      fetchConversationReminders();
    }
  }, [fetchConversations, fetchCompanies, fetchIndividuals, id]);

  const conversation = conversations.find(c => c.id === id);
  
  // Get associated company
  const company = conversation?.companyId 
    ? companies.find(c => c.id === conversation.companyId) 
    : null;
  
  // Get associated individuals
  const conversationIndividuals = individuals.filter(i => 
    conversation?.individualIds?.includes(i.id)
  );

  const fetchConversationReminders = async () => {
    if (!id) return;
    
    setLoadingReminders(true);
    try {
      const conversationReminders = await reminderService.getRemindersByConversation(id);
      setReminders(conversationReminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoadingReminders(false);
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

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

      {/* Reminders Section */}
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 mr-2 text-blue-600" />
          <h2 className="text-lg font-medium">Reminders & Tasks</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto" 
            onClick={() => {
              setSelectedConversation(conversation);
              setIsConversationFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Reminder
          </Button>
        </div>
        
        {loadingReminders ? (
          <div className="space-y-3">
            <Skeleton className="h-[80px] w-full rounded-md" />
            <Skeleton className="h-[80px] w-full rounded-md" />
          </div>
        ) : reminders.length > 0 ? (
          <div className="space-y-3">
            {reminders.map(reminder => (
              <Card key={reminder.id} className={`
                ${reminder.priority === 'high' ? 'border-red-200' : ''} 
                ${reminder.status === 'completed' ? 'bg-green-50' : ''}
                ${reminder.status === 'dismissed' ? 'bg-gray-50' : ''}
              `}>
                <CardHeader className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <CardTitle className="text-base">
                          {reminder.title}
                        </CardTitle>
                        <div className="ml-2">
                          {renderPriorityBadge(reminder.priority)}
                        </div>
                        {reminder.status === 'completed' && (
                          <Badge variant="success" className="ml-2">Completed</Badge>
                        )}
                        {reminder.status === 'dismissed' && (
                          <Badge variant="secondary" className="ml-2">Dismissed</Badge>
                        )}
                      </div>
                      {reminder.description && (
                        <CardDescription className="mt-1">
                          {reminder.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> 
                        {format(new Date(reminder.due_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="py-1 pb-3">
                  <div className="flex flex-wrap items-center">
                    <span className="text-xs text-gray-500 mr-2">Participants:</span>
                    <div className="flex -space-x-2 overflow-hidden">
                      {conversationIndividuals.map((individual) => (
                        <Link 
                          key={individual.id} 
                          to={`/individuals/${individual.id}`}
                          className="hover:z-10 transition-transform hover:scale-110"
                        >
                          <Avatar className="h-6 w-6 border border-white">
                            <AvatarFallback className="text-xs bg-blue-200">
                              {individual.first_name?.[0]}{individual.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="sr-only">{individual.first_name} {individual.last_name}</span>
                        </Link>
                      ))}
                      
                      {company && (
                        <Link 
                          to={`/companies/${company.id}`}
                          className="hover:z-10 transition-transform hover:scale-110"
                        >
                          <Avatar className="h-6 w-6 border border-white">
                            <AvatarFallback className="text-xs bg-purple-200">
                              {company.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="sr-only">{company.name}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
                
                {reminder.status === 'pending' && (
                  <CardFooter className="py-2 flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={async () => {
                        await reminderService.dismissReminder(reminder.id);
                        fetchConversationReminders();
                      }}
                      className="h-7 px-2 text-gray-500"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Dismiss
                    </Button>
                    <Button 
                      size="sm" 
                      variant="default" 
                      onClick={async () => {
                        await reminderService.markReminderAsComplete(reminder.id);
                        fetchConversationReminders();
                      }}
                      className="h-7 px-2"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No reminders for this conversation</p>
            <p className="text-sm mt-1">
              Add a reminder to keep track of follow-ups
            </p>
          </div>
        )}
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

      {/* Add Reminder Dialog */}
      <Dialog open={isConversationFormOpen} onOpenChange={setIsConversationFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
            <DialogDescription>
              Create a reminder for this conversation
            </DialogDescription>
          </DialogHeader>
          <ConversationForm
            initialData={selectedConversation}
            onSuccess={() => {
              setIsConversationFormOpen(false);
              setSelectedConversation(null);
              fetchConversationReminders(); // Refresh reminders
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConversationDetail; 