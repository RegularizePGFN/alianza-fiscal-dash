import React from "react";
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
      pending: { 
        label: "Pendente", 
        variant: "outline" as const,
        className: "border-orange-300 text-orange-700 bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:bg-orange-900/30"
      },
      sent: { 
        label: "Enviado", 
        variant: "default" as const,
        className: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600"
      },
      failed: { 
        label: "Falhou", 
        variant: "destructive" as const,
        className: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600"
      },
      cancelled: { 
        label: "Cancelado", 
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-600"
      },
    } as const;

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: "outline" as const,
      className: "border-gray-300 text-gray-700 bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-900/30"
    };

    return (
      <Badge className={statusInfo.className}>
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
      className="h-8 px-2 flex items-center gap-1 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-200"
    >
      {children}
      <ArrowUpDown className="h-3 w-3 text-blue-500" />
    </Button>
  );

  const messagesList = () => (
    <div className="space-y-4">
      {/* Filtros */}
      <Card className="hover:shadow-md transition-all duration-300 border-opacity-50">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Buscar por cliente, telefone, instância ou mensagem..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
            </div>
            <Select value={instanceFilter} onValueChange={setInstanceFilter}>
              <SelectTrigger className="w-full sm:w-48 transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-purple-100 dark:bg-purple-900/30">
                    <MessageCircle className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <SelectValue placeholder="Filtrar por instância" />
                </div>
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
                className="whitespace-nowrap transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-900/30"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-red-100 dark:bg-red-900/30">
                    <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                  </div>
                  Limpar Filtros
                </div>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="hover:shadow-lg transition-all duration-300 border-opacity-50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b-2 border-blue-100 dark:border-blue-800">
                <TableHead className="w-12">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 w-fit">
                    <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </TableHead>
                <TableHead>
                  <SortButton field="client_name">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-green-100 dark:bg-green-900/30">
                        <User className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      Cliente
                    </div>
                  </SortButton>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30">
                      <Phone className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    Telefone
                  </div>
                </TableHead>
                <TableHead>
                  <SortButton field="instance_name">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-purple-100 dark:bg-purple-900/30">
                        <MessageCircle className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      Instância
                    </div>
                  </SortButton>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-cyan-100 dark:bg-cyan-900/30">
                      <MessageCircle className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    Mensagem
                  </div>
                </TableHead>
                <TableHead>
                  <SortButton field="scheduled_date">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-orange-100 dark:bg-orange-900/30">
                        <Calendar className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                      </div>
                      Data Agendamento
                    </div>
                  </SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="status">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-indigo-100 dark:bg-indigo-900/30">
                        <Clock className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Status
                    </div>
                  </SortButton>
                </TableHead>
                {isAdmin && (
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-teal-100 dark:bg-teal-900/30">
                        <User className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                      </div>
                      Criado por
                    </div>
                  </TableHead>
                )}
                <TableHead className="w-24">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-gray-100 dark:bg-gray-900/30">
                      <Edit className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    </div>
                    Ações
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <div key={message.id}>
                  {/* Linha principal do agendamento */}
                  <TableRow className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(message.id)}
                        className="p-1 h-6 w-6 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                      >
                        {expandedRows.has(message.id) ? (
                          <ChevronUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                          <User className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-foreground font-semibold">{message.client_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <Phone className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-muted-foreground">{message.client_phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30">
                          <MessageCircle className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="font-medium text-purple-700 dark:text-purple-300">{message.instance_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30">
                          <MessageCircle className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <span className="text-sm text-muted-foreground truncate max-w-[150px]" title={message.message_text}>
                          {message.message_text.length > 20 
                            ? `${message.message_text.slice(0, 20)}...` 
                            : message.message_text
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30">
                          <Calendar className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="font-medium text-orange-700 dark:text-orange-300">
                          {format(new Date(message.scheduled_date), "dd/MM/yy HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(message.status)}
                        {message.requires_approval && (
                          <Badge className="text-xs bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600">
                            Aprovação
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {message.profiles && (
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-teal-100 dark:bg-teal-900/30">
                              <User className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                            </div>
                            <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                              {message.profiles.name}
                            </span>
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
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1 h-6 w-6 transition-colors duration-200"
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
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-1 h-6 w-6 transition-colors duration-200"
                            title="Editar agendamento"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMessage(message.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 h-6 w-6 transition-colors duration-200"
                          title="Excluir agendamento"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Linha expandida - só renderiza se estiver expandida */}
                  {expandedRows.has(message.id) && (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 9 : 8} className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 p-0 border-t-2 border-blue-200 dark:border-blue-700">
                        <div className="w-full p-6 space-y-6">
                          {/* Título da seção expandida */}
                          <div className="border-b-2 border-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-700 dark:to-purple-700 pb-4">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                                <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              Informações Detalhadas do Agendamento
                            </h3>
                          </div>

                          {/* Layout em grid para organizar as informações */}
                          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Informações de tempo */}
                            <div className="space-y-4">
                              <h4 className="font-bold text-sm flex items-center gap-2 text-orange-700 dark:text-orange-300">
                                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                Datas e Horários
                              </h4>
                              <div className="space-y-3">
                                <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-orange-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                  <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2 uppercase tracking-wide">Agendado para:</div>
                                  <div className="text-sm font-bold text-foreground">
                                    {format(new Date(message.scheduled_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                  </div>
                                </div>
                                
                                <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-blue-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">Criado em:</div>
                                  <div className="text-sm font-medium text-foreground">
                                    {format(new Date(message.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                  </div>
                                </div>
                                
                                {message.sent_at && (
                                  <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-green-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">Enviado em:</div>
                                    <div className="text-sm font-medium text-foreground">
                                      {format(new Date(message.sent_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Informações do criador (só se for admin) */}
                            {isAdmin && (
                              <div className="space-y-4">
                                <h4 className="font-bold text-sm flex items-center gap-2 text-teal-700 dark:text-teal-300">
                                  <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                                    <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                  </div>
                                  Criado por
                                </h4>
                                <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-teal-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                  {message.profiles ? (
                                    <>
                                      <div className="text-sm font-bold text-foreground">{message.profiles.name}</div>
                                      <div className="text-xs text-muted-foreground mt-1">{message.profiles.email}</div>
                                    </>
                                  ) : (
                                    <div className="text-sm text-muted-foreground">Informação não disponível</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Status e instância */}
                            <div className="space-y-4">
                              <h4 className="font-bold text-sm flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                  <MessageCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                Configurações
                              </h4>
                              <div className="space-y-3">
                                <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-purple-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-wide">Instância:</div>
                                  <div className="text-sm font-bold text-foreground">{message.instance_name}</div>
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-indigo-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                  <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">Status:</div>
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(message.status)}
                                    {message.requires_approval && (
                                      <Badge className="text-xs bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600">
                                        Requer Aprovação
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Informações do cliente */}
                          <div className="space-y-4">
                            <h4 className="font-bold text-sm flex items-center gap-2 text-green-700 dark:text-green-300">
                              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              Dados do Cliente
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-green-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">Nome:</div>
                                <div className="text-sm font-bold text-foreground">{message.client_name}</div>
                              </div>
                              <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-blue-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">Telefone:</div>
                                <div className="text-sm font-bold text-foreground">{message.client_phone}</div>
                              </div>
                            </div>
                          </div>

                          {/* Mensagem completa */}
                          <div className="space-y-4">
                            <h4 className="font-bold text-sm flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                <MessageCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              Conteúdo da Mensagem
                            </h4>
                            <div className="w-full p-6 bg-white dark:bg-gray-800 border-l-4 border-indigo-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                              <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">{message.message_text}</p>
                            </div>
                          </div>

                          {/* Mensagem de erro se houver */}
                          {message.error_message && (
                            <div className="space-y-4">
                              <h4 className="font-bold text-sm flex items-center gap-2 text-red-700 dark:text-red-300">
                                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                  <span className="text-red-600 dark:text-red-400">❌</span>
                                </div>
                                Erro no Envio
                              </h4>
                              <div className="p-6 bg-white dark:bg-gray-800 border-l-4 border-red-400 rounded-lg shadow-sm">
                                <div className="space-y-3">
                                  <p className="text-sm font-bold text-red-700 dark:text-red-300">
                                    Falha no envio da mensagem
                                  </p>
                                  <p className="text-sm text-foreground">
                                    <strong className="text-red-600 dark:text-red-400">Motivo:</strong> {message.error_message}
                                  </p>
                                  <p className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border-l-2 border-yellow-400">
                                    💡 <strong>Dica:</strong> Tente novamente clicando no botão 🔄 ou verifique se o número de telefone está correto.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </div>
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