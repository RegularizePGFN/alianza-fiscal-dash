-- Add requires_approval column to scheduled_messages table
ALTER TABLE public.scheduled_messages 
ADD COLUMN requires_approval boolean NOT NULL DEFAULT false;