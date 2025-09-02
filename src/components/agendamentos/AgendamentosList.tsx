import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, Phone, Trash2, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/types";
import { StatusTabs, MessageStatusFilter } from "./StatusTabs";

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

interface AgendamentosListProps {
  refreshTrigger: number;
  selectedInstance?: string | null;
  statusFilter: MessageStatusFilter;
  onStatusChange: (status: MessageStatusFilter) => void;
}

export const AgendamentosList = ({ 
  refreshTrigger, 
  selectedInstance, 
  statusFilter, 
  onStatusChange 
}: AgendamentosListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [allMessages, setAllMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    scheduled: 0,
    pending_approval: 0,
    sent: 0,
    all: 0
  });

  const isAdmin = user?.role === UserRole.ADMIN;

  const fetchMessages = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('scheduled_messages')
        .select('*')
        .order('scheduled_date', { ascending: false });

      // Se não for admin, mostrar apenas mensagens do usuário
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      // Filtrar por instância se selecionada
      if (selectedInstance) {
        query = query.eq('instance_name', selectedInstance);
      }

      const { data: messagesData, error } = await query;

      if (error) throw error;

      // Se for admin, buscar informações dos usuários que criaram os agendamentos
      if (isAdmin && messagesData && messagesData.length > 0) {
        const userIds = [...new Set(messagesData.map(msg => msg.user_id))];
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);

        // Combinar dados
        const messagesWithProfiles = messagesData.map(message => {
          const profile = profilesData?.find(p => p.id === message.user_id);
          return {
            ...message,
            profiles: profile ? { name: profile.name, email: profile.email } : undefined
          };
        });

        setAllMessages(messagesWithProfiles);
        updateCounts(messagesWithProfiles);
      } else {
        setAllMessages(messagesData || []);
        updateCounts(messagesData || []);
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro ao carregar agendamentos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCounts = (allMessages: ScheduledMessage[]) => {
    const newCounts = {
      all: allMessages.length,
      scheduled: allMessages.filter(m => m.status === 'pending' && !m.requires_approval).length,
      pending_approval: allMessages.filter(m => m.requires_approval === true).length,
      sent: allMessages.filter(m => m.status === 'sent').length,
    };
    setCounts(newCounts);
  };

  const filterMessages = (messages: ScheduledMessage[], filter: MessageStatusFilter) => {
    switch (filter) {
      case 'scheduled':
        return messages.filter(m => m.status === 'pending' && !m.requires_approval);
      case 'pending_approval':
        return messages.filter(m => m.requires_approval === true);
      case 'sent':
        return messages.filter(m => m.status === 'sent');
      case 'all':
      default:
        return messages;
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Agendamento removido",
        description: "O agendamento foi removido com sucesso.",
      });
      
      fetchMessages();
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast({
        title: "Erro ao remover agendamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const retryMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_messages')
        .update({
          status: 'pending',
          error_message: null,
          sent_at: null,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Mensagem reagendada",
        description: "A mensagem foi colocada novamente na fila para envio.",
      });
      
      fetchMessages();
    } catch (error: any) {
      console.error('Error retrying message:', error);
      toast({
        title: "Erro ao reagendar mensagem",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pendente", variant: "outline" },
      sent: { label: "Enviado", variant: "default" },
      failed: { label: "Falhou", variant: "destructive" },
      cancelled: { label: "Cancelado", variant: "secondary" },
    } as const;

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: "outline"
    };

    return (
      <Badge variant={statusInfo.variant as any}>
        {statusInfo.label}
      </Badge>
    );
  };

  useEffect(() => {
    fetchMessages();
  }, [user, refreshTrigger, selectedInstance]);

  useEffect(() => {
    const filteredMessages = filterMessages(allMessages, statusFilter);
    setMessages(filteredMessages);
  }, [allMessages, statusFilter]);

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const emptyStateContent = () => {
    const emptyMessages = {
      all: "Nenhum agendamento encontrado",
      scheduled: "Nenhuma mensagem agendada",
      pending_approval: "Nenhuma mensagem aguardando aprovação",
      sent: "Nenhuma mensagem enviada"
    };

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">
              {emptyMessages[statusFilter]}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {statusFilter === 'all' 
                ? "Comece criando seu primeiro agendamento de mensagem." 
                : `Não há mensagens na categoria ${statusFilter === 'scheduled' ? 'agendadas' : 
                    statusFilter === 'pending_approval' ? 'aguardando aprovação' : 'enviadas'}.`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const messagesList = () => (
    <div className="grid gap-4">
      {messages.map((message) => (
        <Card key={message.id}>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium flex items-center gap-2">
               <MessageCircle className="h-4 w-4" />
                {message.client_name}
                {getStatusBadge(message.status)}
                {message.requires_approval && (
                  <Badge variant="destructive" className="text-xs">
                    Requer Aprovação
                  </Badge>
                )}
              </CardTitle>
             <div className="flex items-center gap-2">
               {(message.status === 'failed' || message.status === 'cancelled') && (
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => retryMessage(message.id)}
                   className="text-blue-600 hover:text-blue-700"
                   title="Tentar novamente"
                 >
                   🔄
                 </Button>
               )}
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => deleteMessage(message.id)}
                 className="text-destructive hover:text-destructive"
                 title="Excluir agendamento"
               >
                 <Trash2 className="h-4 w-4" />
               </Button>
             </div>
           </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                {message.client_phone}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(message.scheduled_date), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </div>
              
              <div className="text-sm">
                <strong>Instância:</strong> {message.instance_name}
              </div>

              {isAdmin && message.profiles && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>
                    Criado por: <strong>{message.profiles.name}</strong> ({message.profiles.email})
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  Criado em: {format(new Date(message.created_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              
              <div className="mt-3 p-3 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{message.message_text}</p>
              </div>
              
              {message.error_message && (
                <div className="mt-2 p-3 border border-destructive/20 bg-destructive/5 rounded-md">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      ❌
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-destructive mb-1">
                        Falha no envio da mensagem
                      </p>
                      <p className="text-sm text-destructive/80">
                        <strong>Motivo:</strong> {message.error_message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tente novamente clicando no botão 🔄 ou verifique se o número de telefone está correto.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {message.sent_at && (
                <div className="text-xs text-muted-foreground">
                  Enviado em: {format(new Date(message.sent_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <StatusTabs
      currentStatus={statusFilter}
      onStatusChange={onStatusChange}
      counts={counts}
    >
      {messages.length === 0 ? emptyStateContent() : messagesList()}
    </StatusTabs>
  );
};