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
    const creatorEmails = conversations.map(c => c.created_by).filter(Boolean);
    return [...new Set(creatorEmails)].sort();
  }, [conversations]);

  // Fetch user information for each creator
  React.useEffect(() => {
    const fetchUserInfo = async () => {
      const users: Record<string, User> = {};
      for (const email of creators) {
        if (!email) continue; // Skip if email is null or undefined
        
        try {
          const { data } = await supabase
            .from('users')
            .select('id, email, user_metadata')
            .eq('email', email)
            .single();
            
          if (data) {
            users[email] = data;
          }
        } catch (error) {
          console.error(`Error fetching user info for ${email}:`, error);
        }
      }
      setCreatorUsers(users);
    };

    if (creators.length > 0) {
      fetchUserInfo();
    }
  }, [creators]);

  const getUserDisplayName = (email: string) => {
    const user = creatorUsers[email];
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    // Fall back to username from email (without domain)
    return email.split('@')[0];
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
            {getUserDisplayName(creator)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CreatorFilter; 