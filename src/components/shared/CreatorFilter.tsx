import React from 'react';
import { useCRMStore } from '@/store/crmStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
}

const CreatorFilter = () => {
  const { conversations, selectedCreator, setSelectedCreator } = useCRMStore();
  const [creatorUsers, setCreatorUsers] = React.useState<Record<string, User>>({});

  // Get unique creators from conversations
  const creators = React.useMemo(() => {
    const creatorIds = conversations.map(c => c.created_by).filter(Boolean);
    return [...new Set(creatorIds)].sort();
  }, [conversations]);

  // Fetch user information for each creator
  React.useEffect(() => {
    const fetchUserInfo = async () => {
      const users: Record<string, User> = {};
      
      // Get current user info from session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const currentUser = session.user;
        // Add the current user to our users object if they're a creator
        if (creators.includes(currentUser.id)) {
          users[currentUser.id] = {
            id: currentUser.id,
            email: currentUser.email || '',
            user_metadata: currentUser.user_metadata
          };
        }
      }

      // For other users, we'll just store their IDs
      creators.forEach(creatorId => {
        if (!users[creatorId]) {
          users[creatorId] = {
            id: creatorId,
            email: '',
            user_metadata: {}
          };
        }
      });
      
      setCreatorUsers(users);
    };

    if (creators.length > 0) {
      fetchUserInfo();
    }
  }, [creators]);

  const getUserDisplayName = (creatorId: string) => {
    const user = creatorUsers[creatorId];
    if (!user) return 'Unknown';
    
    // First try to get the display name from metadata
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    // Then try to get username from email
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    // Fall back to shortened UUID
    return creatorId.substring(0, 8) + '...';
  };

  return (
    <Select 
      value={selectedCreator === null ? 'all' : selectedCreator}
      onValueChange={(value) => setSelectedCreator(value === 'all' ? null : value)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filter by creator" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Creators</SelectItem>
        {creators.map(creatorId => (
          <SelectItem key={creatorId} value={creatorId}>
            {getUserDisplayName(creatorId)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CreatorFilter; 