import { supabase } from '@/lib/supabase';
import { googleAuthService } from './googleAuthService';
import { findIndividualByEmailOrName, createIndividualFromAttendee } from './individualService';

export const calendarImportService = {
  /**
   * Import events from Google Calendar as conversations
   */
  async importCalendarEvents(days = 30, bucketId: string) {
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
            .eq('bucket_id', bucketId)
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
            
            // Use our improved individual lookup (must be bucket-aware)
            let individual = await findIndividualByEmailOrName(email, name);
            let company_id_for_attendee = null;
            
            if (!individual) {
              // Create a new individual from this attendee (bucket-aware, no company_id direct set)
              // TODO: Refactor createIndividualFromAttendee to support bucketId and join table
              // For now, create individual in bucket, then link to company if found
              const domain = email.split('@')[1];
              if (domain) {
                const { data: companyMatch } = await supabase
                  .from('companies')
                  .select('id')
                  .ilike('website', `%${domain}%`)
                  .eq('bucket_id', bucketId)
                  .maybeSingle();
                if (companyMatch) {
                  company_id_for_attendee = companyMatch.id;
                }
              }
              // Create the new individual in the bucket
              const { data: newIndividual, error: indError } = await supabase
                .from('individuals')
                .insert({
                  name: name || email.split('@')[0],
                  email: email,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  created_by: user.id,
                  bucket_id: bucketId
                })
                .select('id, name, email')
                .single();
              if (indError) {
                results.errors.push(indError.message);
                continue;
              }
              if (company_id_for_attendee) {
                // Link individual to company in join table
                await supabase.from('individual_companies').insert({
                  individual_id: newIndividual.id,
                  company_id: company_id_for_attendee,
                  bucket_id: bucketId
                });
              }
              individual = { ...newIndividual, company_id: company_id_for_attendee, name: newIndividual.name, email: newIndividual.email };
              results.attendeesCreated++;
            } else {
              results.attendeesFound++;
              // If the found individual has a company_id, use it for the conversation if not already set
              if (individual.company_id) {
                company_id_for_attendee = individual.company_id;
              }
            }
            
            if (individual) {
              individualIds.push(individual.id);
              // Use the company ID from the first found individual
              if (!company_id && company_id_for_attendee) {
                company_id = company_id_for_attendee;
              }
            }
          }
          
          // Create the conversation in the bucket
          const newConversation = {
            title: event.summary || 'Calendar Event',
            date: event.start?.dateTime || event.start?.date,
            summary: event.description || '',
            company_id: company_id,
            calendar_event_id: event.id,
            calendar_link: event.htmlLink,
            import_source: 'google_calendar',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: user.id,
            notes: '',
            next_steps: '',
            bucket_id: bucketId
          };
          
          const { data: convoData, error: insertError } = await supabase
            .from('conversations')
            .insert(newConversation)
            .select('id')
            .single();
          
          if (insertError) {
            results.errors.push(insertError.message);
            continue;
          }
          
          // Link individuals to conversation
          if (individualIds.length > 0) {
            const associations = individualIds.map(indId => ({
              conversation_id: convoData.id,
              individual_id: indId
            }));
            await supabase.from('conversation_individuals').insert(associations);
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