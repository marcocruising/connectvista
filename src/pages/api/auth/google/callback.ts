import { NextApiRequest, NextApiResponse } from 'next';
import { googleAuthService } from '@/services/googleAuthService';
import { supabase } from '@/lib/supabase';
import { withIronSessionApiRoute } from 'iron-session/next';

// Configure iron-session (same configuration as in connect.ts)
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
  
  const { code, error: googleError } = req.query;
  
  // Handle Google auth errors
  if (googleError) {
    console.error('Google auth error:', googleError);
    return res.redirect('/settings?error=google_auth_failed');
  }
  
  if (!code || typeof code !== 'string') {
    return res.redirect('/settings?error=invalid_code');
  }
  
  try {
    // Get user ID from session or directly from auth
    let userId = req.session.userId;
    
    // If no userId in session, get from auth
    if (!userId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return res.status(401).redirect('/login?error=session_expired');
      }
      
      userId = user.id;
    }
    
    // Process OAuth callback
    await googleAuthService.handleCallback(code, userId);
    
    // Redirect to settings page with success message
    res.redirect('/settings?success=google_connected');
  } catch (error) {
    console.error('Error handling Google callback:', error);
    res.redirect('/settings?error=google_connection_failed');
  }
}

export default withIronSessionApiRoute(handler, sessionOptions); 