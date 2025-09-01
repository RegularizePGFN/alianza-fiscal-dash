import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, Phone, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/types";

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
}

interface AgendamentosListProps {
  refreshTrigger: number;
}

export const AgendamentosList = ({ refreshTrigger }: AgendamentosListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
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

      // Se não for admin, mostrar apenas mensagens do usuário
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
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
  }, [user, refreshTrigger]);

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

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">
              Nenhum agendamento
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Comece criando seu primeiro agendamento de mensagem.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {messages.map((message) => (
        <Card key={message.id}>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium flex items-center gap-2">
               <MessageCircle className="h-4 w-4" />
               {message.client_name}
               {getStatusBadge(message.status)}
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
              
              <div className="mt-3 p-3 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{message.message_text}</p>
              </div>
              
              {message.error_message && (
                <div className="mt-2 p-2 bg-destructive/10 rounded-md">
                  <p className="text-sm text-destructive">{message.error_message}</p>
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
};