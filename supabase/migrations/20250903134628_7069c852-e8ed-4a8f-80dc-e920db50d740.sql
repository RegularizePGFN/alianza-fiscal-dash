-- Adicionar constraint unique para evitar mensagens duplicadas
ALTER TABLE public.scheduled_messages 
ADD CONSTRAINT unique_scheduled_message 
UNIQUE (client_phone, message_text, scheduled_date);