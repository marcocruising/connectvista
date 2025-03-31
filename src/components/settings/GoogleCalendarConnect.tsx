import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Calendar, Check, X, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { googleAuthService } from '@/services/googleAuthService';
import { calendarImportService } from '@/services/calendarImportService';
import { AttendeeMatchingDialog } from '@/components/calendar/AttendeeMatchingDialog';
import { createIndividualFromAttendee } from '@/services/individualService';

export function GoogleCalendarConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [unprocessedAttendees, setUnprocessedAttendees] = useState<any[]>([]);
  const [showAttendeeDialog, setShowAttendeeDialog] = useState(false);
  
  // Check connection status on component mount
  useEffect(() => {
    async function checkConnectionStatus() {
      try {
        setIsLoading(true);
        
        const connected = await googleAuthService.hasActiveConnection();
        setIsConnected(connected);
      } catch (err) {
        console.error('Error checking Google connection:', err);
        setError('Failed to check Google Calendar connection status');
      } finally {
        setIsLoading(false);
      }
    }
    
    checkConnectionStatus();
  }, []);
  
  // Handle Google Calendar connect button
  const handleConnect = () => {
    const authUrl = googleAuthService.getAuthUrl();
    window.location.href = authUrl;
  };
  
  // Handle disconnect button
  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      
      await googleAuthService.disconnectCalendar();
      
      setIsConnected(false);
      toast({
        title: "Google Calendar disconnected",
        description: "Your Google Calendar has been disconnected successfully."
      });
    } catch (err) {
      console.error('Error disconnecting Google Calendar:', err);
      setError('Failed to disconnect Google Calendar');
      toast({
        variant: "destructive",
        title: "Disconnection failed",
        description: "There was an error disconnecting your Google Calendar."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle import button - modified to show attendee matching dialog
  const handleImport = async () => {
    try {
      setIsImporting(true);
      
      // First, get calendar events
      const events = await googleAuthService.getCalendarEvents(30);
      setCalendarEvents(events);
      
      // Extract all unique attendees
      const allAttendees: any[] = [];
      events.forEach(event => {
        if (event.attendees) {
          // Skip the organizer (usually current user)
          const eventAttendees = event.attendees.filter((a: any) => 
            !a.organizer && !a.self && a.email
          );
          
          eventAttendees.forEach((attendee: any) => {
            // Check if we already have this attendee
            if (!allAttendees.some(a => a.email === attendee.email)) {
              allAttendees.push(attendee);
            }
          });
        }
      });
      
      if (allAttendees.length === 0) {
        toast({
          title: "No external attendees found",
          description: "We couldn't find any external attendees in your calendar events.",
        });
        return;
      }
      
      // Set unprocessed attendees and show dialog
      setUnprocessedAttendees(allAttendees);
      setShowAttendeeDialog(true);
      
    } catch (err) {
      console.error('Error importing calendar events:', err);
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "There was an error importing your calendar events."
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  // Handle attendee matching completion
  const handleAttendeeMatchComplete = async (matches: { attendeeId: string; individualId: string; isNew: boolean }[]) => {
    try {
      setIsImporting(true);
      
      // Process new individuals
      const newIndividualMap = new Map();
      
      for (const match of matches) {
        if (match.isNew) {
          // This is a new individual to create
          const attendee = unprocessedAttendees.find(a => a.email === match.attendeeId);
          if (attendee) {
            const newIndividual = await createIndividualFromAttendee(
              attendee.email, 
              attendee.displayName || attendee.email.split('@')[0]
            );
            
            if (newIndividual) {
              newIndividualMap.set(match.attendeeId, newIndividual.id);
            }
          }
        }
      }
      
      // Now let's create conversations from calendar events
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Track results
      const results = {
        imported: 0,
        skipped: 0,
        errors: [] as string[]
      };
      
      // Process each event
      for (const event of calendarEvents) {
        try {
          // Skip events without attendees
          if (!event.attendees || event.attendees.length <= 1) {
            results.skipped++;
            continue;
          }
          
          // Check if event already imported
          const { data: existingConvo } = await supabase
            .from('conversations')
            .select('id')
            .eq('calendar_event_id', event.id)
            .maybeSingle();
          
          if (existingConvo) {
            results.skipped++;
            continue;
          }
          
          // Get attendees who were matched
          const individual_ids: string[] = [];
          let company_id = null;
          
          for (const attendee of event.attendees) {
            if (!attendee.email || attendee.organizer || attendee.self) {
              continue;
            }
            
            // Look up match
            const match = matches.find(m => m.attendeeId === attendee.email);
            
            if (match) {
              // Get actual individual ID (for new individuals)
              let individualId = match.individualId;
              if (match.isNew) {
                individualId = newIndividualMap.get(match.attendeeId) || individualId;
              }
              
              // Only add if it's a valid ID
              if (!individualId.startsWith('new-')) {
                individual_ids.push(individualId);
                
                // Get company ID if we don't have one yet
                if (!company_id) {
                  const { data } = await supabase
                    .from('individuals')
                    .select('company_id')
                    .eq('id', individualId)
                    .maybeSingle();
                    
                  if (data?.company_id) {
                    company_id = data.company_id;
                  }
                }
              }
            }
          }
          
          // If no individuals matched, skip
          if (individual_ids.length === 0) {
            results.skipped++;
            continue;
          }
          
          // Create the conversation
          const newConversation = {
            title: event.summary || 'Calendar Event',
            date: event.start?.dateTime || event.start?.date,
            summary: event.description || '',
            individual_ids: individual_ids,
            company_id: company_id,
            calendar_event_id: event.id,
            calendar_link: event.htmlLink,
            import_source: 'google_calendar',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user.id,
            notes: '',
            next_steps: ''
          };
          
          const { error: insertError } = await supabase
            .from('conversations')
            .insert(newConversation);
          
          if (insertError) {
            throw new Error(`Failed to create conversation: ${insertError.message}`);
          }
          
          results.imported++;
        } catch (err: any) {
          results.errors.push(err.message || 'Unknown error');
          console.error('Error processing event:', err);
        }
      }
      
      // Show completion message
      toast({
        title: "Calendar Import Complete",
        description: `Imported ${results.imported} events as conversations. ${results.skipped} events were skipped.`,
      });
      
    } catch (err) {
      console.error('Error processing matched attendees:', err);
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "There was an error importing your calendar events."
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
          <CardDescription>
            Connect your Google Calendar to automatically import meetings as conversations
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center mb-4">
            <div className="mr-4">
              {isConnected ? (
                <div className="flex items-center text-green-600">
                  <Check className="mr-2 h-5 w-5" />
                  <span className="font-medium">Connected</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <X className="mr-2 h-5 w-5" />
                  <span className="font-medium">Not connected</span>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            {isConnected 
              ? "Your Google Calendar is connected. You can import calendar events as conversations."
              : "Connect your Google Calendar to automatically import meetings as conversations."}
          </p>
        </CardContent>
        
        <CardFooter className="flex flex-wrap gap-2">
          {isConnected ? (
            <>
              <Button 
                variant="default"
                onClick={handleImport}
                disabled={isImporting}
                className="mr-2"
              >
                <Download className="mr-2 h-4 w-4" />
                {isImporting ? 'Importing...' : 'Import Calendar Events'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                disabled={isLoading || isImporting}
              >
                Disconnect Calendar
              </Button>
            </>
          ) : (
            <Button 
              variant="default"
              onClick={handleConnect}
              disabled={isLoading}
            >
              Connect Google Calendar
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Attendee Matching Dialog */}
      <AttendeeMatchingDialog
        open={showAttendeeDialog}
        onOpenChange={setShowAttendeeDialog}
        attendees={unprocessedAttendees}
        onComplete={handleAttendeeMatchComplete}
      />
    </>
  );
} 