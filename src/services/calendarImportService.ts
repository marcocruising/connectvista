import { supabase } from '@/lib/supabase';
import { googleAuthService } from './googleAuthService';
import { findIndividualByEmailOrName, createIndividualFromAttendee } from './individualService';

export const calendarImportService = {
  /**
   * Import events from Google Calendar as conversations
   */
  async importCalendarEvents(days = 30) {
    try {
      // Get calendar events
      const events = await googleAuthService.getCalendarEvents(days);
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Keep track of imported and skipped events
      const results = {
        imported: 0,
        skipped: 0,
        attendeesFound: 0,
        attendeesCreated: 0,
        errors: [] as string[]
      };
      
      // Process each event
      for (const event of events) {
        try {
          // Skip events without attendees (likely personal events)
          if (!event.attendees || event.attendees.length <= 1) {
            results.skipped++;
            continue;
          }
          
          // Check if this event is already imported
          const { data: existingConvo } = await supabase
            .from('conversations')
            .select('id')
            .eq('calendar_event_id', event.id)
            .maybeSingle();
          
          if (existingConvo) {
            results.skipped++;
            continue;
          }
          
          // Process attendees
          const individualIds = [];
          let company_id = null;
          
          // Skip the organizer (usually the current user)
          const attendees = event.attendees.filter(a => !a.organizer && !a.self);
          
          for (const attendee of attendees) {
            const email = attendee.email;
            const name = attendee.displayName || email.split('@')[0];
            
            // Use our improved individual lookup
            let individual = await findIndividualByEmailOrName(email, name);
            
            if (!individual) {
              // Create a new individual from this attendee
              individual = await createIndividualFromAttendee(email, name);
              
              if (individual) {
                results.attendeesCreated++;
              }
            } else {
              results.attendeesFound++;
            }
            
            if (individual) {
              individualIds.push(individual.id);
              
              // Use the company ID from the first found individual
              if (!company_id && individual.company_id) {
                company_id = individual.company_id;
              }
            }
          }
          
          // Create the conversation - make sure to use the exact database column names
          const newConversation = {
            title: event.summary || 'Calendar Event',
            date: event.start?.dateTime || event.start?.date,
            summary: event.description || '',
            individual_ids: individualIds,
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
        } catch (eventError: any) {
          results.errors.push(eventError.message);
          console.error('Error processing event:', eventError);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error importing calendar events:', error);
      throw error;
    }
  },
  
  /**
   * Match attendees with individuals in the database
   * If no match is found, create new individuals
   */
  async matchAttendees(attendees: any[]) {
    // Implementation for attendee matching
    // This would be more complex and handle creating/matching individuals
  }
}; 