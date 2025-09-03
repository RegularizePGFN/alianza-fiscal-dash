-- Create enum for funnel stages
CREATE TYPE funnel_stage AS ENUM (
  'prospeccao',
  'qualificacao', 
  'proposta_enviada',
  'negociacao',
  'venda_realizada',
  'cobranca',
  'pos_venda'
);

-- Create enum for recurrence types
CREATE TYPE recurrence_type AS ENUM (
  'daily',
  'weekly', 
  'monthly'
);

-- Create table for recurring message schedules
CREATE TABLE public.recurring_message_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  message_text TEXT NOT NULL,
  instance_name TEXT NOT NULL,
  funnel_stage funnel_stage NOT NULL DEFAULT 'prospeccao',
  recurrence_type recurrence_type NOT NULL,
  recurrence_interval INTEGER NOT NULL DEFAULT 1,
  day_of_week INTEGER, -- 0-6 for weekly (0 = Sunday)
  day_of_month INTEGER, -- 1-31 for monthly
  execution_time TIME NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_executions INTEGER DEFAULT 0,
  last_execution_date DATE,
  next_execution_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_message_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own recurring schedules" 
ON public.recurring_message_schedules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring schedules" 
ON public.recurring_message_schedules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring schedules" 
ON public.recurring_message_schedules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring schedules" 
ON public.recurring_message_schedules 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all recurring schedules" 
ON public.recurring_message_schedules 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all recurring schedules" 
ON public.recurring_message_schedules 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Create trigger for updated_at
CREATE TRIGGER update_recurring_message_schedules_updated_at
BEFORE UPDATE ON public.recurring_message_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();