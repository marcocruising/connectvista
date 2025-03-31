import { supabase } from '@/lib/supabase';
import { encrypt, decrypt } from '@/lib/encryption';

// Get correct environment variables based on environment
const GOOGLE_CLIENT_ID = import.meta.env.MODE === 'production' 
  ? import.meta.env.VITE_GOOGLE_CLIENT_ID_PROD 
  : import.meta.env.VITE_GOOGLE_CLIENT_ID_DEV;

const GOOGLE_CLIENT_SECRET = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_GOOGLE_CLIENT_SECRET_PROD
  : import.meta.env.VITE_GOOGLE_CLIENT_SECRET_DEV;

const GOOGLE_REDIRECT_URI = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_GOOGLE_REDIRECT_URI_PROD
  : import.meta.env.VITE_GOOGLE_REDIRECT_URI_DEV;

export const googleAuthService = {
  /**
   * Get authorization URL for Google OAuth
   */
  getAuthUrl: () => {
    // Define Google OAuth parameters
    const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly');
    const responseType = 'code';
    const accessType = 'offline';
    const prompt = 'consent';
    
    // Construct the URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=${responseType}&scope=${scope}&access_type=${accessType}&prompt=${prompt}`;
    
    return authUrl;
  },
  
  /**
   * Process OAuth callback and store tokens
   */
  async handleCallback(code: string) {
    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
      }
      
      const tokenData = await tokenResponse.json();
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Authentication required. Please log in.');
      }
      
      // Encrypt tokens before storing
      const encryptedAccessToken = encrypt(tokenData.access_token);
      const encryptedRefreshToken = encrypt(tokenData.refresh_token || ''); // Some flows might not return refresh token
      
      // Store in database
      const { error } = await supabase
        .from('user_calendar_connections')
        .upsert({
          user_id: user.id,
          provider: 'google',
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expiry: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'user_id, provider'
        });
      
      if (error) {
        console.error('Error storing Google tokens:', error);
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error in Google OAuth callback:', error);
      throw error;
    }
  },
  
  /**
   * Get calendar events using access token
   */
  async getCalendarEvents(days = 30) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get tokens from database
      const { data, error } = await supabase
        .from('user_calendar_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'google')
        .eq('is_active', true)
        .single();
      
      if (error || !data) {
        throw new Error('No active Google connection found');
      }
      
      // Decrypt access token
      const accessToken = decrypt(data.access_token);
      
      // Calculate time ranges
      const now = new Date();
      const pastDate = new Date();
      pastDate.setDate(now.getDate() - days);
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + 7); // Also get upcoming events for the next 7 days
      
      // Format dates for Google Calendar API
      const timeMin = pastDate.toISOString();
      const timeMax = futureDate.toISOString();
      
      // Fetch calendar events
      const calendarResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&maxResults=100`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!calendarResponse.ok) {
        if (calendarResponse.status === 401) {
          // Token expired - we should implement refresh token logic here
          throw new Error('Session expired. Please reconnect your Google Calendar.');
        }
        
        const errorData = await calendarResponse.json();
        throw new Error(`Calendar API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const calendarData = await calendarResponse.json();
      return calendarData.items || [];
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw error;
    }
  },
  
  /**
   * Check if user has active Google Calendar connection
   */
  async hasActiveConnection() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Check for calendar connections in your database
      const { data, error } = await supabase
        .from('user_calendar_connections')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking connection:', error);
      throw error;
    }
  },
  
  /**
   * Disconnect Google Calendar
   */
  async disconnectCalendar() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update the connection status in your database
      const { error } = await supabase
        .from('user_calendar_connections')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      throw error;
    }
  }
}; 