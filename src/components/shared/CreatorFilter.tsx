import React from 'react';
import { useCRMStore } from '@/store/crmStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const CreatorFilter = () => {
  const { conversations, selectedCreator, setSelectedCreator } = useCRMStore();

  // Get unique creators from conversations
  const creators = React.useMemo(() => {
    const creatorEmails = conversations.map(c => c.created_by).filter(Boolean);
    return [...new Set(creatorEmails)].sort();
  }, [conversations]);

  const getUserDisplayName = (email: string) => {
    if (!email) return 'Unknown';
    
    // Some created_by values might be UUIDs rather than emails
    if (email.includes('@')) {
      // Extract username from email address
      return email.split('@')[0];
    }
    
    // If it's not an email, just return the value as is
    return email;
  };

  return (
    <Select
      value={selectedCreator || 'all'}
      onValueChange={(value) => setSelectedCreator(value === 'all' ? null : value)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Filter by creator" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Creators</SelectItem>
        {creators.map((creator) => (
          <SelectItem key={creator} value={creator}>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-purple-200">
                  {getUserDisplayName(creator)[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{getUserDisplayName(creator)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CreatorFilter; 