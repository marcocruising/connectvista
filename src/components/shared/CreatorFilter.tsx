import React from 'react';
import { useCRMStore } from '@/store/crmStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
}

const CreatorFilter = () => {
  const { conversations, selectedCreators, setSelectedCreators } = useCRMStore();
  const [creatorUsers, setCreatorUsers] = React.useState<Record<string, User>>({});

  // Get unique creators from conversations
  const creators = React.useMemo(() => {
    const creatorIds = conversations.map(c => c.created_by).filter(Boolean);
    return [...new Set(creatorIds)].sort();
  }, [conversations]);

  // Fetch user information using Supabase's auth.admin API instead of profiles table
  React.useEffect(() => {
    const fetchUserInfo = async () => {
      const users: Record<string, User> = {};
      // For each creator ID, get the current user's session which contains the user info
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const currentUser = session.user;
        // Add the current user to our users object
        if (creators.includes(currentUser.id)) {
          users[currentUser.id] = {
            id: currentUser.id,
            email: currentUser.email || '',
            user_metadata: currentUser.user_metadata
          };
        }
      }
      
      // For other users, we can't fetch their data directly, so we'll just display IDs
      creators.forEach(creatorId => {
        if (!users[creatorId]) {
          users[creatorId] = {
            id: creatorId,
            email: ''
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
    if (!creatorId) return 'Unknown';
    
    const user = creatorUsers[creatorId];
    if (!user) {
      // Display a shortened UUID if we don't have user info
      return creatorId.substring(0, 8) + '...';
    }
    
    // First try to get the display name from metadata (from Google sign-in)
    if (user.user_metadata?.name) {
      return user.user_metadata.name;
    }
    
    // Then try to get the full name
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

  const handleCreatorChange = (value: string) => {
    if (value === 'all') {
      setSelectedCreators([]);
    } else {
      setSelectedCreators([value]);
    }
  };

  return (
    <Select
      value={selectedCreators.length ? selectedCreators[0] : 'all'}
      onValueChange={handleCreatorChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Filter by creator" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Creators</SelectItem>
        {creators.map((creator) => (
          <SelectItem key={creator} value={creator}>
            {getUserDisplayName(creator)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CreatorFilter; 