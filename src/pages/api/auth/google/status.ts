import { NextApiRequest, NextApiResponse } from 'next';
import { googleAuthService } from '@/services/googleAuthService';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check if user has active Google connection
    const connected = await googleAuthService.hasActiveConnection(user.id);
    
    res.status(200).json({ connected });
  } catch (error) {
    console.error('Error checking Google connection status:', error);
    res.status(500).json({ error: 'Failed to check connection status' });
  }
} 