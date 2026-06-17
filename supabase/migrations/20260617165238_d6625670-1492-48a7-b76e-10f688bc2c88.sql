
-- Allow chatbot-originated registrations (no salesperson yet) and Chatwoot dedup
ALTER TABLE public.client_registrations
  ALTER COLUMN salesperson_id DROP NOT NULL,
  ALTER COLUMN salesperson_name DROP NOT NULL;

ALTER TABLE public.client_registrations
  ADD COLUMN IF NOT EXISTS conversation_id BIGINT,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';

CREATE UNIQUE INDEX IF NOT EXISTS client_registrations_conversation_id_uniq
  ON public.client_registrations(conversation_id)
  WHERE conversation_id IS NOT NULL;
