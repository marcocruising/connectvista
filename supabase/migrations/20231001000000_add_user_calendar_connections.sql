CREATE TABLE IF NOT EXISTS public.user_calendar_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL DEFAULT 'google',
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMPTZ NOT NULL,
  calendar_ids TEXT[] NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ NULL,
  sync_from_date TIMESTAMPTZ NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  UNIQUE(user_id, provider)
);

-- Add fields to conversations table if not already present
ALTER TABLE IF EXISTS public.conversations
ADD COLUMN IF NOT EXISTS calendar_event_id TEXT NULL,
ADD COLUMN IF NOT EXISTS calendar_link TEXT NULL, 
ADD COLUMN IF NOT EXISTS import_source VARCHAR(50) NULL;

-- Add index for faster duplicate detection
CREATE INDEX IF NOT EXISTS idx_conversations_calendar_event_id 
ON public.conversations(calendar_event_id) 
WHERE calendar_event_id IS NOT NULL; 