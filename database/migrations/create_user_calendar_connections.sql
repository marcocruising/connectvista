CREATE TABLE user_calendar_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL DEFAULT 'google',
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMPTZ NOT NULL,
  calendar_ids TEXT[] NULL,  -- Store selected calendar IDs
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Track sync settings & status
  last_sync_at TIMESTAMPTZ NULL,
  sync_from_date TIMESTAMPTZ NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Enforce one active connection per provider per user
  UNIQUE(user_id, provider)
);

-- Update conversations table to link with calendar events
ALTER TABLE conversations 
ADD COLUMN calendar_event_id TEXT NULL,
ADD COLUMN calendar_link TEXT NULL,
ADD COLUMN import_source VARCHAR(50) NULL;

-- Add index for faster duplicate detection
CREATE INDEX idx_conversations_calendar_event_id ON conversations(calendar_event_id) 
WHERE calendar_event_id IS NOT NULL; 