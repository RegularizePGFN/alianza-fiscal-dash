import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, Phone, Trash2, User, Clock, ChevronDown, ChevronUp, Filter, ArrowUpDown, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/types";
import { StatusTabs, MessageStatusFilter } from "./StatusTabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CreateAgendamentoModal } from "./CreateAgendamentoModal";

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

type SortField = 'scheduled_date' | 'client_name' | 'instance_name' | 'status' | 'created_at';
type SortOrder = 'asc' | 'desc';

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
    sent: 0,
    all: 0
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('scheduled_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [instanceFilter, setInstanceFilter] = useState<string>('all');
  const [editingMessage, setEditingMessage] = useState<ScheduledMessage | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;

  const editMessage = (message: ScheduledMessage) => {
    setEditingMessage(message);
  };

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
      scheduled: allMessages.filter(m => m.status === 'pending').length,
      sent: allMessages.filter(m => m.status === 'sent').length,
    };
    setCounts(newCounts);
  };

  const filterMessages = (messages: ScheduledMessage[], filter: MessageStatusFilter) => {
    switch (filter) {
      case 'scheduled':
        return messages.filter(m => m.status === 'pending');
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

  const toggleRowExpansion = (messageId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortMessages = (messages: ScheduledMessage[]) => {
    return [...messages].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'scheduled_date':
          aValue = new Date(a.scheduled_date);
          bValue = new Date(b.scheduled_date);
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'client_name':
          aValue = a.client_name.toLowerCase();
          bValue = b.client_name.toLowerCase();
          break;
        case 'instance_name':
          aValue = a.instance_name.toLowerCase();
          bValue = b.instance_name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filterAndSortMessages = (allMessages: ScheduledMessage[], statusFilter: MessageStatusFilter) => {
    let filtered = filterMessages(allMessages, statusFilter);
    
    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.client_phone.includes(searchTerm) ||
        msg.instance_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message_text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtro de instância
    if (instanceFilter && instanceFilter !== 'all') {
      filtered = filtered.filter(msg => msg.instance_name === instanceFilter);
    }
    
    return sortMessages(filtered);
  };

  const getUniqueInstances = () => {
    return [...new Set(allMessages.map(msg => msg.instance_name))].sort();
  };

  useEffect(() => {
    const processedMessages = filterAndSortMessages(allMessages, statusFilter);
    setMessages(processedMessages);
  }, [allMessages, statusFilter, sortField, sortOrder, searchTerm, instanceFilter]);

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
                : `Não há mensagens na categoria ${statusFilter === 'scheduled' ? 'agendadas' : 'enviadas'}.`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 px-2 flex items-center gap-1 hover:bg-muted"
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </Button>
  );

  const messagesList = () => (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por cliente, telefone, instância ou mensagem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={instanceFilter} onValueChange={setInstanceFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por instância" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as instâncias</SelectItem>
                {getUniqueInstances().map(instance => (
                  <SelectItem key={instance} value={instance}>
                    {instance}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchTerm || (instanceFilter && instanceFilter !== 'all')) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setInstanceFilter('all');
                }}
                className="whitespace-nowrap"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>
                  <SortButton field="client_name">Cliente</SortButton>
                </TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>
                  <SortButton field="instance_name">Instância</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="scheduled_date">Data Agendamento</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="status">Status</SortButton>
                </TableHead>
                {isAdmin && <TableHead>Criado por</TableHead>}
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <>
                  <TableRow key={message.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(message.id)}
                            className="p-1 h-6 w-6"
                          >
                            {expandedRows.has(message.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {message.client_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {message.client_phone}
                      </div>
                    </TableCell>
                    <TableCell>{message.instance_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(message.scheduled_date), "dd/MM/yy HH:mm", {
                          locale: ptBR,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(message.status)}
                        {message.requires_approval && (
                          <Badge variant="destructive" className="text-xs">
                            Aprovação
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {message.profiles && (
                          <div className="text-sm">
                            {message.profiles.name}
                          </div>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                       <div className="flex items-center gap-1">
                         {(message.status === 'failed' || message.status === 'cancelled') && (
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => retryMessage(message.id)}
                             className="text-blue-600 hover:text-blue-700 p-1 h-6 w-6"
                             title="Tentar novamente"
                           >
                             🔄
                           </Button>
                         )}
                         {message.status === 'pending' && (
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => editMessage(message)}
                             className="text-blue-600 hover:text-blue-700 p-1 h-6 w-6"
                             title="Editar agendamento"
                           >
                             <Edit className="h-3 w-3" />
                           </Button>
                         )}
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => deleteMessage(message.id)}
                           className="text-destructive hover:text-destructive p-1 h-6 w-6"
                           title="Excluir agendamento"
                         >
                           <Trash2 className="h-3 w-3" />
                         </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Linha expandida */}
                  <Collapsible open={expandedRows.has(message.id)}>
                    <CollapsibleContent>
                      <TableRow>
                         <TableCell colSpan={isAdmin ? 8 : 7} className="bg-muted/30 p-0">
                            <div className="p-6 space-y-6 w-full">
                             {/* Informações de criação e usuário */}
                             <div className="space-y-2">
                               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                 <Clock className="h-3 w-3" />
                                 <span>
                                   Criado em: {format(new Date(message.created_at), "dd/MM/yyyy 'às' HH:mm", {
                                     locale: ptBR,
                                   })}
                                 </span>
                               </div>
                               
                               {message.sent_at && (
                                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                   <Clock className="h-3 w-3" />
                                   <span>
                                     Enviado em: {format(new Date(message.sent_at), "dd/MM/yyyy 'às' HH:mm", {
                                       locale: ptBR,
                                     })}
                                   </span>
                                 </div>
                               )}
                               
                               {isAdmin && message.profiles && (
                                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                   <User className="h-3 w-3" />
                                   <span>
                                     Criado por: <strong>{message.profiles.name}</strong> ({message.profiles.email})
                                   </span>
                                 </div>
                               )}
                             </div>
                             
                              {/* Mensagem completa ocupando toda a largura */}
                              <div className="space-y-3">
                                <div className="text-sm font-medium text-foreground">Mensagem:</div>
                                <div className="p-4 bg-background border rounded-lg shadow-sm">
                                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message_text}</p>
                                </div>
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
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <StatusTabs
      currentStatus={statusFilter}
      onStatusChange={onStatusChange}
      counts={counts}
    >
      {messages.length === 0 ? emptyStateContent() : messagesList()}
      
      <CreateAgendamentoModal
        open={!!editingMessage}
        onOpenChange={(open) => !open && setEditingMessage(null)}
        onSuccess={() => {
          setEditingMessage(null);
          fetchMessages();
        }}
        editingMessage={editingMessage}
      />
    </StatusTabs>
  );
};