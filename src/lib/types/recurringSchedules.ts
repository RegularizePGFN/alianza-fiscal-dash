export type FunnelStage = 
  | 'prospeccao'
  | 'qualificacao' 
  | 'proposta_enviada'
  | 'negociacao'
  | 'venda_realizada'
  | 'cobranca'
  | 'pos_venda'
  | string; // Allow custom stages

export type RecurrenceType = 'daily' | 'weekly' | 'monthly';

export interface RecurringMessageSchedule {
  id: string;
  user_id: string;
  client_name: string;
  client_phone: string;
  message_text: string;
  instance_name: string;
  funnel_stage: FunnelStage;
  recurrence_type: RecurrenceType;
  recurrence_interval: number;
  day_of_week?: number; // 0-6 for weekly (0 = Sunday)
  day_of_month?: number; // 1-31 for monthly
  execution_time: string; // HH:MM format
  start_date: string; // YYYY-MM-DD format
  end_date?: string; // YYYY-MM-DD format
  is_active: boolean;
  total_executions: number;
  last_execution_date?: string;
  next_execution_date?: string;
  created_at: string;
  updated_at: string;
}

export const FUNNEL_STAGES: Record<FunnelStage, { label: string; color: string }> = {
  prospeccao: { 
    label: 'Prospecção', 
    color: 'hsl(var(--chart-1))' 
  },
  qualificacao: { 
    label: 'Qualificação', 
    color: 'hsl(var(--chart-2))' 
  },
  proposta_enviada: { 
    label: 'Proposta Enviada', 
    color: 'hsl(var(--chart-3))' 
  },
  negociacao: { 
    label: 'Negociação', 
    color: 'hsl(var(--chart-4))' 
  },
  venda_realizada: { 
    label: 'Venda Realizada', 
    color: 'hsl(var(--chart-5))' 
  },
  cobranca: { 
    label: 'Cobrança', 
    color: 'hsl(var(--destructive))' 
  },
  pos_venda: { 
    label: 'Pós-Venda', 
    color: 'hsl(var(--success))' 
  }
};

export const RECURRENCE_TYPE_LABELS: Record<RecurrenceType, string> = {
  daily: 'Diário',
  weekly: 'Semanal', 
  monthly: 'Mensal'
};

export const WEEKDAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];