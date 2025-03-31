import { NextApiRequest, NextApiResponse } from 'next';
import { googleAuthService } from '@/services/googleAuthService';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Disconnect calendar
    await googleAuthService.disconnectCalendar(user.id);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    res.status(500).json({ error: 'Failed to disconnect Google Calendar' });
  }
} 