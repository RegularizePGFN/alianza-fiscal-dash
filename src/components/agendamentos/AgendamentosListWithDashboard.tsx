import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/lib/types";
import { AgendamentosList } from "./AgendamentosList";
import { SchedulesDashboard } from "./dashboard/SchedulesDashboard";
import { MessageStatusFilter } from "./StatusTabs";

interface ScheduledMessage {
  id: string;
  client_name: string;
  client_phone: string;
  message_text: string;
  scheduled_date: string;
  status: string;
  instance_name: string;
  user_id: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  requires_approval?: boolean;
  profiles?: {
    name: string;
    email: string;
  };
}

interface AgendamentosListWithDashboardProps {
  refreshTrigger: number;
  selectedInstance?: string | null;
  statusFilter: MessageStatusFilter;
  onStatusChange: (status: MessageStatusFilter) => void;
}

export const AgendamentosListWithDashboard = ({
  refreshTrigger,
  selectedInstance,
  statusFilter,
  onStatusChange
}: AgendamentosListWithDashboardProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === UserRole.ADMIN;

  const fetchMessages = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('scheduled_messages')
        .select('*')
        .order('scheduled_date', { ascending: false });

      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Buscar nomes dos usuários separadamente para os admins
      let messagesWithProfiles: ScheduledMessage[] = data || [];
      
      if (isAdmin && data && data.length > 0) {
        const userIds = [...new Set(data.map(m => m.user_id))];
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        messagesWithProfiles = data.map(message => ({
          ...message,
          profiles: profileMap.get(message.user_id) ? {
            name: profileMap.get(message.user_id)?.name || 'Nome não informado',
            email: profileMap.get(message.user_id)?.email || 'Email não informado'
          } : undefined
        }));
      }
      
      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user?.id, refreshTrigger]);

  // Filtrar mensagens baseado nos filtros aplicados
  const filteredMessages = messages.filter(message => {
    // Filtro por instância
    if (selectedInstance && message.instance_name !== selectedInstance) {
      return false;
    }

    // Filtro por status
    if (statusFilter === 'scheduled' && message.status !== 'pending') {
      return false;
    }
    if (statusFilter === 'sent' && message.status !== 'sent') {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Lista de Agendamentos */}
      <AgendamentosList 
        refreshTrigger={refreshTrigger}
        selectedInstance={selectedInstance}
        statusFilter={statusFilter}
        onStatusChange={onStatusChange}
      />
      
      {/* Dashboard de Relatórios */}
      <div className="pt-8 border-t">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Relatórios de Agendamentos</h3>
          <p className="text-muted-foreground">
            Análise detalhada dos seus agendamentos
            {statusFilter !== 'all' && (
              <span className="ml-2 text-sm text-primary">
                (Filtrado por: {statusFilter === 'scheduled' ? 'Agendadas' : statusFilter === 'sent' ? 'Enviadas' : 'Todas'})
              </span>
            )}
            {selectedInstance && (
              <span className="ml-2 text-sm text-primary">
                (Instância: {selectedInstance})
              </span>
            )}
          </p>
        </div>
        <SchedulesDashboard 
          messages={filteredMessages}
          loading={loading}
        />
      </div>
    </div>
  );
};