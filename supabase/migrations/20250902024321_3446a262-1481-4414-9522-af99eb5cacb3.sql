-- Create conversation_history table
CREATE TABLE public.conversation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_phone TEXT NOT NULL,
  instance_name TEXT NOT NULL,
  message_text TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('sent', 'received')),
  message_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  whatsapp_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- Create policies for conversation_history
CREATE POLICY "Users can view conversation history for their instances" 
ON public.conversation_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_whatsapp_instances 
    WHERE instance_name = conversation_history.instance_name 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all conversation history" 
ON public.conversation_history 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "System can insert conversation history" 
ON public.conversation_history 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_conversation_history_contact_instance ON public.conversation_history(contact_phone, instance_name);
CREATE INDEX idx_conversation_history_timestamp ON public.conversation_history(message_timestamp DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_conversation_history_updated_at
BEFORE UPDATE ON public.conversation_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();