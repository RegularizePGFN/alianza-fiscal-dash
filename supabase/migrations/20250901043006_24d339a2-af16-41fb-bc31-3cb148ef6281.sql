-- Criar tabela para mapear usuários às caixas de entrada da Evolution API
CREATE TABLE public.user_whatsapp_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  instance_name TEXT NOT NULL,
  instance_token TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, instance_name)
);

-- Criar tabela para agendamentos de mensagens
CREATE TABLE public.scheduled_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  instance_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_name TEXT,
  message_text TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies para user_whatsapp_instances
CREATE POLICY "Usuários podem ver suas instâncias" 
ON public.user_whatsapp_instances 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todas as instâncias" 
ON public.user_whatsapp_instances 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins podem inserir instâncias" 
ON public.user_whatsapp_instances 
FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admins podem atualizar instâncias" 
ON public.user_whatsapp_instances 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins podem deletar instâncias" 
ON public.user_whatsapp_instances 
FOR DELETE 
USING (get_current_user_role() = 'admin');

-- RLS policies para scheduled_messages
CREATE POLICY "Usuários podem ver seus agendamentos" 
ON public.scheduled_messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os agendamentos" 
ON public.scheduled_messages 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Usuários podem criar agendamentos" 
ON public.scheduled_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus agendamentos" 
ON public.scheduled_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus agendamentos" 
ON public.scheduled_messages 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem atualizar todos os agendamentos" 
ON public.scheduled_messages 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

-- Criar triggers para update timestamps
CREATE TRIGGER update_user_whatsapp_instances_updated_at
BEFORE UPDATE ON public.user_whatsapp_instances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_messages_updated_at
BEFORE UPDATE ON public.scheduled_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para performance
CREATE INDEX idx_scheduled_messages_user_id ON public.scheduled_messages(user_id);
CREATE INDEX idx_scheduled_messages_status ON public.scheduled_messages(status);
CREATE INDEX idx_scheduled_messages_scheduled_date ON public.scheduled_messages(scheduled_date);
CREATE INDEX idx_user_whatsapp_instances_user_id ON public.user_whatsapp_instances(user_id);