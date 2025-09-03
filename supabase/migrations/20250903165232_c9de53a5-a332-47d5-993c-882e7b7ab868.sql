-- Criar tabela para agendamentos recorrentes
CREATE TABLE public.recurring_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  message_text TEXT NOT NULL,
  instance_name TEXT NOT NULL,
  
  -- Configurações de recorrência
  recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('daily', 'weekly', 'monthly')),
  recurrence_interval INTEGER NOT NULL DEFAULT 1 CHECK (recurrence_interval > 0),
  start_date DATE NOT NULL,
  end_date DATE,
  total_occurrences INTEGER,
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = domingo
  
  -- Controle de execução
  is_active BOOLEAN NOT NULL DEFAULT true,
  next_execution_date DATE NOT NULL,
  executions_count INTEGER NOT NULL DEFAULT 0,
  last_execution_date DATE,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_end_condition CHECK (
    (end_date IS NOT NULL) OR (total_occurrences IS NOT NULL)
  ),
  CONSTRAINT monthly_day_required CHECK (
    (recurrence_type != 'monthly') OR (day_of_month IS NOT NULL)
  ),
  CONSTRAINT weekly_day_required CHECK (
    (recurrence_type != 'weekly') OR (day_of_week IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.recurring_schedules ENABLE ROW LEVEL SECURITY;

-- Policies para recurring_schedules
CREATE POLICY "Admins podem ver todos os agendamentos recorrentes" 
ON public.recurring_schedules 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Usuários podem ver agendamentos recorrentes de suas instâncias" 
ON public.recurring_schedules 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (EXISTS (
    SELECT 1 FROM (user_whatsapp_instances uwi
      JOIN user_instance_access uia ON (uwi.id = uia.instance_id))
    WHERE uwi.instance_name = recurring_schedules.instance_name 
      AND uia.user_id = auth.uid()
  ))
);

CREATE POLICY "Usuários podem criar agendamentos recorrentes em suas instâncias" 
ON public.recurring_schedules 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) AND 
  (EXISTS (
    SELECT 1 FROM (user_whatsapp_instances uwi
      JOIN user_instance_access uia ON (uwi.id = uia.instance_id))
    WHERE uwi.instance_name = recurring_schedules.instance_name 
      AND uia.user_id = auth.uid()
  ))
);

CREATE POLICY "Usuários podem atualizar agendamentos recorrentes de suas instâncias" 
ON public.recurring_schedules 
FOR UPDATE 
USING (
  (auth.uid() = user_id) AND 
  (EXISTS (
    SELECT 1 FROM (user_whatsapp_instances uwi
      JOIN user_instance_access uia ON (uwi.id = uia.instance_id))
    WHERE uwi.instance_name = recurring_schedules.instance_name 
      AND uia.user_id = auth.uid()
  ))
);

CREATE POLICY "Usuários podem deletar agendamentos recorrentes de suas instâncias" 
ON public.recurring_schedules 
FOR DELETE 
USING (
  (auth.uid() = user_id) AND 
  (EXISTS (
    SELECT 1 FROM (user_whatsapp_instances uwi
      JOIN user_instance_access uia ON (uwi.id = uia.instance_id))
    WHERE uwi.instance_name = recurring_schedules.instance_name 
      AND uia.user_id = auth.uid()
  ))
);

CREATE POLICY "Admins podem gerenciar todos agendamentos recorrentes" 
ON public.recurring_schedules 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Trigger para updated_at
CREATE TRIGGER update_recurring_schedules_updated_at
  BEFORE UPDATE ON public.recurring_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_recurring_schedules_user_id ON public.recurring_schedules(user_id);
CREATE INDEX idx_recurring_schedules_instance_name ON public.recurring_schedules(instance_name);
CREATE INDEX idx_recurring_schedules_next_execution ON public.recurring_schedules(next_execution_date) WHERE is_active = true;
CREATE INDEX idx_recurring_schedules_active ON public.recurring_schedules(is_active, next_execution_date);