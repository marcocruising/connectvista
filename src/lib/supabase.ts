import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Update your site URL for production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Use the correct site URL based on the environment
const siteUrl = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : window.location.origin;

// Create the Supabase client with the correct site URL
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    redirectTo: `${siteUrl}/auth/callback`,
    persistSession: true,
    autoRefreshToken: true,
  }
}); 