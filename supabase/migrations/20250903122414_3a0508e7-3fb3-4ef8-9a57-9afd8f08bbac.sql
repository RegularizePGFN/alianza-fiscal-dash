-- Criar tabela de relacionamento entre usuários e instâncias WhatsApp
CREATE TABLE public.user_instance_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES public.user_whatsapp_instances(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL DEFAULT 'user', -- 'owner', 'user', 'read_only'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, instance_id)
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.user_instance_access ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para user_instance_access
CREATE POLICY "Usuários podem ver seus acessos às instâncias" 
ON public.user_instance_access 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os acessos às instâncias" 
ON public.user_instance_access 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins podem gerenciar acessos às instâncias" 
ON public.user_instance_access 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Migrar dados existentes da tabela user_whatsapp_instances
INSERT INTO public.user_instance_access (user_id, instance_id, access_type)
SELECT user_id, id, 'owner'
FROM public.user_whatsapp_instances
WHERE user_id IS NOT NULL;

-- Trigger para manter updated_at atualizado
CREATE TRIGGER update_user_instance_access_updated_at
BEFORE UPDATE ON public.user_instance_access
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Atualizar as políticas de RLS para scheduled_messages para considerar a nova estrutura
DROP POLICY IF EXISTS "Usuários podem ver seus agendamentos" ON public.scheduled_messages;
DROP POLICY IF EXISTS "Usuários podem criar agendamentos" ON public.scheduled_messages;
DROP POLICY IF EXISTS "Usuários podem atualizar seus agendamentos" ON public.scheduled_messages;
DROP POLICY IF EXISTS "Usuários podem deletar seus agendamentos" ON public.scheduled_messages;

-- Novas políticas para scheduled_messages considerando acesso a instâncias
CREATE POLICY "Usuários podem ver agendamentos de suas instâncias" 
ON public.scheduled_messages 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.user_whatsapp_instances uwi
    JOIN public.user_instance_access uia ON uwi.id = uia.instance_id
    WHERE uwi.instance_name = scheduled_messages.instance_name 
    AND uia.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem criar agendamentos em suas instâncias" 
ON public.scheduled_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.user_whatsapp_instances uwi
    JOIN public.user_instance_access uia ON uwi.id = uia.instance_id
    WHERE uwi.instance_name = scheduled_messages.instance_name 
    AND uia.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem atualizar agendamentos de suas instâncias" 
ON public.scheduled_messages 
FOR UPDATE 
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.user_whatsapp_instances uwi
    JOIN public.user_instance_access uia ON uwi.id = uia.instance_id
    WHERE uwi.instance_name = scheduled_messages.instance_name 
    AND uia.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem deletar agendamentos de suas instâncias" 
ON public.scheduled_messages 
FOR DELETE 
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.user_whatsapp_instances uwi
    JOIN public.user_instance_access uia ON uwi.id = uia.instance_id
    WHERE uwi.instance_name = scheduled_messages.instance_name 
    AND uia.user_id = auth.uid()
  )
);