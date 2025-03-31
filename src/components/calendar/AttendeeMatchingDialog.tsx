import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCRMStore } from '@/store/crmStore';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, UserPlus } from 'lucide-react';

type Attendee = {
  id: string;
  email: string;
  name: string;
  displayName: string;
  matched: boolean;
  individualId?: string;
  companyId?: string;
};

type AttendeeMatchingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendees: any[];
  onComplete: (matches: { attendeeId: string; individualId: string; isNew: boolean }[]) => void;
};

export function AttendeeMatchingDialog({
  open,
  onOpenChange,
  attendees,
  onComplete
}: AttendeeMatchingDialogProps) {
  const { individuals, companies, fetchIndividuals, fetchCompanies } = useCRMStore();
  const [loading, setLoading] = useState(true);
  const [processedAttendees, setProcessedAttendees] = useState<Attendee[]>([]);
  const [selectedTab, setSelectedTab] = useState('unmatched');
  
  // Load data when dialog opens
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([
        fetchIndividuals(), 
        fetchCompanies()
      ]);
      
      // Process attendees
      const processed = attendees.map(a => ({
        id: a.email,
        email: a.email,
        name: a.displayName || a.email.split('@')[0],
        displayName: a.displayName || a.email.split('@')[0],
        matched: false,
        individualId: undefined,
        companyId: undefined
      }));
      
      // Try to auto-match by email
      for (const attendee of processed) {
        const match = individuals.find(i => 
          i.email && i.email.toLowerCase() === attendee.email.toLowerCase()
        );
        
        if (match) {
          attendee.matched = true;
          attendee.individualId = match.id;
          attendee.companyId = match.company_id;
        }
      }
      
      setProcessedAttendees(processed);
      setLoading(false);
    }
    
    if (open) {
      loadData();
    }
  }, [open, attendees, fetchIndividuals, fetchCompanies, individuals]);
  
  // Handle individual selection for an attendee
  const handleSelectIndividual = (attendeeId: string, individualId: string) => {
    setProcessedAttendees(prev => prev.map(a => {
      if (a.id === attendeeId) {
        const individual = individuals.find(i => i.id === individualId);
        return {
          ...a,
          matched: true,
          individualId,
          companyId: individual?.company_id
        };
      }
      return a;
    }));
  };
  
  // Create a new individual for an attendee
  const handleCreateIndividual = async (attendee: Attendee) => {
    // In a real implementation, we would call an API to create the individual
    // For now, we'll just mark it for creation
    setProcessedAttendees(prev => prev.map(a => {
      if (a.id === attendee.id) {
        return {
          ...a,
          matched: true,
          individualId: `new-${attendee.id}`, // Special marker for new individuals
        };
      }
      return a;
    }));
  };
  
  // Skip matching for an attendee
  const handleSkipAttendee = (attendeeId: string) => {
    setProcessedAttendees(prev => prev.map(a => {
      if (a.id === attendeeId) {
        return {
          ...a,
          matched: true,
          individualId: undefined
        };
      }
      return a;
    }));
  };
  
  // Complete the matching process
  const handleComplete = () => {
    const matches = processedAttendees
      .filter(a => a.matched && a.individualId)
      .map(a => ({
        attendeeId: a.id,
        individualId: a.individualId!,
        isNew: a.individualId!.startsWith('new-')
      }));
    
    onComplete(matches);
    onOpenChange(false);
  };
  
  // Get unmatched and matched attendees
  const unmatchedAttendees = processedAttendees.filter(a => !a.matched);
  const matchedAttendees = processedAttendees.filter(a => a.matched);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Match Calendar Attendees</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="unmatched" disabled={unmatchedAttendees.length === 0}>
                  Unmatched ({unmatchedAttendees.length})
                </TabsTrigger>
                <TabsTrigger value="matched" disabled={matchedAttendees.length === 0}>
                  Matched ({matchedAttendees.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="unmatched" className="max-h-[400px] overflow-y-auto">
                {unmatchedAttendees.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    All attendees have been matched
                  </div>
                ) : (
                  <div className="space-y-4 py-2">
                    {unmatchedAttendees.map(attendee => (
                      <Card key={attendee.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-4">
                            <div>
                              <div className="font-medium">{attendee.displayName}</div>
                              <div className="text-sm text-muted-foreground">{attendee.email}</div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Select 
                                onValueChange={(value) => handleSelectIndividual(attendee.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Match with existing contact" />
                                </SelectTrigger>
                                <SelectContent>
                                  {individuals.map(individual => (
                                    <SelectItem key={individual.id} value={individual.id}>
                                      {individual.name} ({individual.email || 'No email'})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleCreateIndividual(attendee)}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Create
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleSkipAttendee(attendee.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="matched" className="max-h-[400px] overflow-y-auto">
                {matchedAttendees.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No attendees have been matched yet
                  </div>
                ) : (
                  <div className="space-y-4 py-2">
                    {matchedAttendees.map(attendee => {
                      const matchedIndividual = attendee.individualId?.startsWith('new-')
                        ? { id: attendee.individualId, name: attendee.displayName, email: attendee.email }
                        : individuals.find(i => i.id === attendee.individualId);
                      
                      const matchedCompany = attendee.companyId
                        ? companies.find(c => c.id === attendee.companyId)
                        : null;
                      
                      return (
                        <Card key={attendee.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium">{attendee.displayName}</div>
                                <div className="text-sm text-muted-foreground">{attendee.email}</div>
                              </div>
                              
                              <div className="text-right">
                                {matchedIndividual ? (
                                  <>
                                    <div className="font-medium flex items-center">
                                      <Check className="h-4 w-4 mr-1 text-green-500" />
                                      {attendee.individualId?.startsWith('new-') ? 'New contact' : 'Matched with'}
                                    </div>
                                    <div className="text-sm">
                                      {matchedIndividual.name}
                                      {matchedCompany && ` (${matchedCompany.name})`}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-muted-foreground">Skipped</div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleComplete}>
                Complete
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 