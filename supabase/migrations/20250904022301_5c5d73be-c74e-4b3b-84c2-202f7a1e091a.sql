-- Criar tabela para mensagens pré-definidas
CREATE TABLE public.predefined_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.predefined_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - usuários podem gerenciar apenas suas próprias mensagens
CREATE POLICY "Users can view their own predefined messages" 
ON public.predefined_messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own predefined messages" 
ON public.predefined_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predefined messages" 
ON public.predefined_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own predefined messages" 
ON public.predefined_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins podem gerenciar todas as mensagens
CREATE POLICY "Admins can manage all predefined messages" 
ON public.predefined_messages 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_predefined_messages_updated_at
BEFORE UPDATE ON public.predefined_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();