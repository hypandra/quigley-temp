-- Chat interaction log for Rippled Echoes (prefix: re_)
-- Fire-and-forget from the chat API route

CREATE TABLE IF NOT EXISTS re_chat_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  era_id TEXT NOT NULL,
  persona_name TEXT NOT NULL,
  year_label TEXT NOT NULL,
  location TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'anthropic/claude-3.5-haiku',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS re_chat_log_era_idx ON re_chat_log(era_id);
CREATE INDEX IF NOT EXISTS re_chat_log_created_idx ON re_chat_log(created_at);
