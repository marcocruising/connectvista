import { NextApiRequest, NextApiResponse } from 'next';
import { googleAuthService } from '@/services/googleAuthService';
import { supabase } from '@/lib/supabase';
import { withIronSessionApiRoute } from 'iron-session/next';

// Configure iron-session
const sessionOptions = {
  cookieName: 'crm_session',
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Generate Google auth URL
    const authUrl = googleAuthService.getAuthUrl();
    
    // Store user ID in session for callback
    req.session.userId = user.id;
    await req.session.save();
    
    // Redirect to Google auth page
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Google auth:', error);
    res.status(500).json({ error: 'Failed to initiate Google authentication' });
  }
}

export default withIronSessionApiRoute(handler, sessionOptions); 