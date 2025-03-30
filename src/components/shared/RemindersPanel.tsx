import React, { useEffect, useState } from 'react';
import { useCRMStore } from '@/store/crmStore';
import { Reminder } from '@/types/crm';
import { format, isPast, isToday, addDays, isBefore } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Calendar, AlertTriangle, Check, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const RemindersPanel: React.FC = () => {
  const { 
    reminders, 
    conversations,
    individuals,
    companies,
    fetchReminders, 
    fetchConversations,
    fetchIndividuals,
    fetchCompanies,
    markReminderComplete, 
    dismissReminder, 
    isLoadingReminders 
  } = useCRMStore();
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    // Make sure we have all the data we need
    const loadData = async () => {
      await Promise.all([
        fetchReminders(),
        fetchConversations(),
        fetchIndividuals(),
        fetchCompanies()
      ]);
    };
    
    loadData();
  }, [fetchReminders, fetchConversations, fetchIndividuals, fetchCompanies]);

  const handleMarkComplete = async (id: string) => {
    await markReminderComplete(id);
  };

  const handleDismiss = async (id: string) => {
    await dismissReminder(id);
  };

  // Group reminders into categories
  const today = reminders.filter(r => 
    r.status === 'pending' && 
    isToday(new Date(r.due_date))
  );
  
  const overdue = reminders.filter(r => 
    r.status === 'pending' && 
    isPast(new Date(r.due_date)) && 
    !isToday(new Date(r.due_date))
  );
  
  const upcoming = reminders.filter(r => 
    r.status === 'pending' && 
    !isPast(new Date(r.due_date))
  );
  
  const thisWeek = upcoming.filter(r => 
    isBefore(
      new Date(r.due_date), 
      addDays(new Date(), 7)
    )
  );
  
  const completed = reminders.filter(r => r.status === 'completed');
  const dismissed = reminders.filter(r => r.status === 'dismissed');

  // Render priority badge
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="ml-2">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="ml-2">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="ml-2">Low</Badge>;
      default:
        return null;
    }
  };

  // Render reminder card
  const renderReminderCard = (reminder: Reminder) => {
    // Find the conversation related to this reminder
    const conversation = conversations.find(c => c.id === reminder.conversation_id);
    
    // Get related individuals and company
    const relatedIndividuals = conversation
      ? individuals.filter(i => conversation.individualIds?.includes(i.id))
      : [];
      
    const relatedCompany = conversation?.companyId
      ? companies.find(c => c.id === conversation.companyId)
      : null;
    
    return (
      <Card key={reminder.id} className={`
        mb-3 
        ${reminder.priority === 'high' ? 'border-red-200' : ''} 
        ${isPast(new Date(reminder.due_date)) && reminder.status === 'pending' ? 'bg-red-50' : ''}
        ${isToday(new Date(reminder.due_date)) && reminder.status === 'pending' ? 'bg-yellow-50' : ''}
        ${reminder.status === 'completed' ? 'bg-green-50' : ''}
        ${reminder.status === 'dismissed' ? 'bg-gray-50' : ''}
      `}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-base">
                {reminder.title}
                {renderPriorityBadge(reminder.priority)}
              </CardTitle>
              <CardDescription>
                {reminder.conversation_id && (
                  <Link 
                    to={`/conversations/${reminder.conversation_id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View conversation
                  </Link>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" /> 
              {format(new Date(reminder.due_date), 'MMM d, yyyy')}
            </div>
          </div>
        </CardHeader>
        
        {/* Participants section */}
        {(relatedIndividuals.length > 0 || relatedCompany) && (
          <CardContent className="py-1 pb-3">
            <div className="flex flex-wrap items-center">
              <span className="text-xs text-gray-500 mr-2">Participants:</span>
              <div className="flex -space-x-2 overflow-hidden">
                <TooltipProvider>
                  {relatedIndividuals.map((individual, index) => (
                    <Tooltip key={individual.id}>
                      <TooltipTrigger asChild>
                        <Link to={`/individuals/${individual.id}`}>
                          <Avatar className="h-6 w-6 border border-white">
                            <AvatarFallback className="text-xs bg-blue-200">
                              {individual.first_name?.[0]}{individual.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{individual.first_name} {individual.last_name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  
                  {relatedCompany && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to={`/companies/${relatedCompany.id}`}>
                          <Avatar className="h-6 w-6 border border-white">
                            <AvatarFallback className="text-xs bg-purple-200">
                              {relatedCompany.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{relatedCompany.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        )}
        
        {reminder.description && (
          <CardContent className="py-1">
            <p className="text-sm text-gray-600">{reminder.description}</p>
          </CardContent>
        )}
        
        {reminder.status === 'pending' && (
          <CardFooter className="pt-1 pb-2 flex justify-end gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => handleDismiss(reminder.id)}
              className="h-8 px-2 text-gray-500"
            >
              <X className="h-4 w-4 mr-1" />
              Dismiss
            </Button>
            <Button 
              size="sm" 
              variant="default" 
              onClick={() => handleMarkComplete(reminder.id)}
              className="h-8 px-2"
            >
              <Check className="h-4 w-4 mr-1" />
              Complete
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <Bell className="h-5 w-5 mr-2 text-blue-600" />
        <h2 className="text-lg font-medium">Reminders</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming" className="relative">
            Upcoming
            {upcoming.length > 0 && (
              <Badge variant="default" className="ml-2">
                {upcoming.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="overdue" className="relative">
            Overdue
            {overdue.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {overdue.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        {isLoadingReminders ? (
          <div className="space-y-3">
            <Skeleton className="h-[120px] w-full rounded-md" />
            <Skeleton className="h-[120px] w-full rounded-md" />
            <Skeleton className="h-[120px] w-full rounded-md" />
          </div>
        ) : (
          <>
            <TabsContent value="upcoming" className="space-y-4">
              {today.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                    <h3 className="text-sm font-medium text-yellow-600">Today</h3>
                  </div>
                  {today.map(renderReminderCard)}
                </div>
              )}
              
              {thisWeek.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                    <h3 className="text-sm font-medium text-blue-600">This Week</h3>
                  </div>
                  {thisWeek.map(renderReminderCard)}
                </div>
              )}
              
              {upcoming.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No upcoming reminders</p>
                  <p className="text-sm mt-1">
                    Add reminders to conversations to keep track of follow-ups
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="overdue">
              {overdue.length > 0 ? (
                <div>
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                    <h3 className="text-sm font-medium text-red-600">Overdue</h3>
                  </div>
                  {overdue.map(renderReminderCard)}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Check className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No overdue reminders</p>
                  <p className="text-sm mt-1">You're all caught up!</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {completed.length > 0 ? (
                <div>
                  {completed.map(renderReminderCard)}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Check className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No completed reminders</p>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}; 