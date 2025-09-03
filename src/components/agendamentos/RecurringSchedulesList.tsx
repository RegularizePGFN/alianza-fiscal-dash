import React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, Phone, Trash2, User, Clock, ChevronDown, ChevronUp, Filter, ArrowUpDown, Edit, Repeat, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface RecurringSchedule {
  id: string;
  client_name: string;
  client_phone: string;
  message_text: string;
  instance_name: string;
  user_id: string;
  recurrence_type: 'daily' | 'weekly' | 'monthly';
  recurrence_interval: number;
  start_date: string;
  end_date?: string;
  total_occurrences?: number;
  day_of_month?: number;
  day_of_week?: number;
  is_active: boolean;
  next_execution_date: string;
  executions_count: number;
  last_execution_date?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    email: string;
  };
}

interface RecurringSchedulesListProps {
  refreshTrigger: number;
}

type SortField = 'next_execution_date' | 'client_name' | 'instance_name' | 'recurrence_type' | 'created_at';
type SortOrder = 'asc' | 'desc';

export const RecurringSchedulesList = ({ 
  refreshTrigger 
}: RecurringSchedulesListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [allSchedules, setAllSchedules] = useState<RecurringSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('next_execution_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [instanceFilter, setInstanceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all', 'active', 'inactive'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const isAdmin = user?.role === UserRole.ADMIN;

  const fetchSchedules = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('recurring_schedules')
        .select('*')
        .order('next_execution_date', { ascending: false });

      // Se não for admin, mostrar apenas agendamentos do usuário
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data: schedulesData, error } = await query;

      if (error) throw error;

      // Se for admin, buscar informações dos usuários que criaram os agendamentos
      if (isAdmin && schedulesData && schedulesData.length > 0) {
        const userIds = [...new Set(schedulesData.map(schedule => schedule.user_id))];
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);

        // Combinar dados
        const schedulesWithProfiles = schedulesData.map(schedule => {
          const profile = profilesData?.find(p => p.id === schedule.user_id);
          return {
            ...schedule,
            recurrence_type: schedule.recurrence_type as 'daily' | 'weekly' | 'monthly',
            profiles: profile ? { name: profile.name, email: profile.email } : undefined
          };
        });

        setAllSchedules(schedulesWithProfiles);
      } else {
        const typedSchedules = (schedulesData || []).map(schedule => ({
          ...schedule,
          recurrence_type: schedule.recurrence_type as 'daily' | 'weekly' | 'monthly'
        }));
        setAllSchedules(typedSchedules);
      }
    } catch (error: any) {
      console.error('Error fetching recurring schedules:', error);
      toast({
        title: "Erro ao carregar agendamentos recorrentes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Agendamento recorrente removido",
        description: "O agendamento recorrente foi removido com sucesso.",
      });
      
      fetchSchedules();
    } catch (error: any) {
      console.error('Error deleting recurring schedule:', error);
      toast({
        title: "Erro ao remover agendamento recorrente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('recurring_schedules')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: !currentStatus ? "Agendamento ativado" : "Agendamento pausado",
        description: `O agendamento recorrente foi ${!currentStatus ? 'ativado' : 'pausado'} com sucesso.`,
      });
      
      fetchSchedules();
    } catch (error: any) {
      console.error('Error toggling schedule status:', error);
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRecurrenceText = (schedule: RecurringSchedule) => {
    const { recurrence_type, recurrence_interval, day_of_month, day_of_week } = schedule;
    
    const intervalText = recurrence_interval === 1 ? '' : `a cada ${recurrence_interval} `;
    
    switch (recurrence_type) {
      case 'daily':
        return `${intervalText}dia${recurrence_interval > 1 ? 's' : ''}`;
      case 'weekly':
        const dayNames = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
        const dayName = day_of_week !== undefined ? dayNames[day_of_week] : '';
        return `${intervalText}semana${recurrence_interval > 1 ? 's' : ''} (${dayName})`;
      case 'monthly':
        return `${intervalText}mês${recurrence_interval > 1 ? 'es' : ''} (dia ${day_of_month})`;
      default:
        return recurrence_type;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={isActive 
        ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600"
        : "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-600"
      }>
        {isActive ? "Ativo" : "Pausado"}
      </Badge>
    );
  };

  useEffect(() => {
    fetchSchedules();
  }, [user, refreshTrigger]);

  const toggleRowExpansion = (scheduleId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scheduleId)) {
        newSet.delete(scheduleId);
      } else {
        newSet.add(scheduleId);
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

  const sortSchedules = (schedules: RecurringSchedule[]) => {
    return [...schedules].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'next_execution_date':
          aValue = new Date(a.next_execution_date);
          bValue = new Date(b.next_execution_date);
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
        case 'recurrence_type':
          aValue = a.recurrence_type;
          bValue = b.recurrence_type;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filterAndSortSchedules = (allSchedules: RecurringSchedule[]) => {
    let filtered = [...allSchedules];
    
    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(schedule => 
        schedule.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.client_phone.includes(searchTerm) ||
        schedule.instance_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.message_text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtro de instância
    if (instanceFilter && instanceFilter !== 'all') {
      filtered = filtered.filter(schedule => schedule.instance_name === instanceFilter);
    }
    
    // Aplicar filtro de status
    if (statusFilter === 'active') {
      filtered = filtered.filter(schedule => schedule.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(schedule => !schedule.is_active);
    }
    
    return sortSchedules(filtered);
  };

  const getUniqueInstances = () => {
    return [...new Set(allSchedules.map(schedule => schedule.instance_name))].sort();
  };

  useEffect(() => {
    const processedSchedules = filterAndSortSchedules(allSchedules);
    setSchedules(processedSchedules);
    setCurrentPage(1); // Reset página ao mudar filtros
  }, [allSchedules, sortField, sortOrder, searchTerm, instanceFilter, statusFilter]);

  // Aplicar paginação
  const getPaginatedSchedules = (schedules: RecurringSchedule[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return schedules.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(schedules.length / itemsPerPage);
  const paginatedSchedules = getPaginatedSchedules(schedules);

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

  const emptyStateContent = () => (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <Repeat className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">
            Nenhum agendamento recorrente encontrado
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Comece criando seu primeiro agendamento recorrente para automatizar o envio de mensagens.
          </p>
        </div>
      </CardContent>
    </Card>
  );

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

  const schedulesList = () => (
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32 transition-all duration-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-green-100 dark:bg-green-900/30">
                    <RotateCcw className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Pausados</SelectItem>
              </SelectContent>
            </Select>
            
            {(searchTerm || (instanceFilter && instanceFilter !== 'all') || statusFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setInstanceFilter('all');
                  setStatusFilter('all');
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
              <TableRow className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b-2 border-purple-100 dark:border-purple-800">
                <TableHead className="w-12">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 w-fit">
                    <ChevronDown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
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
                  <SortButton field="recurrence_type">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-indigo-100 dark:bg-indigo-900/30">
                        <Repeat className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Recorrência
                    </div>
                  </SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="next_execution_date">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-orange-100 dark:bg-orange-900/30">
                        <Calendar className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                      </div>
                      Próxima Execução
                    </div>
                  </SortButton>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-green-100 dark:bg-green-900/30">
                      <Clock className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    Status
                  </div>
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
              {paginatedSchedules.map((schedule) => (
                <React.Fragment key={schedule.id}>
                  {/* Linha principal do agendamento recorrente */}
                  <TableRow className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-900/10 dark:hover:to-blue-900/10 transition-all duration-200">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(schedule.id)}
                        className="p-1 h-6 w-6 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200"
                      >
                        {expandedRows.has(schedule.id) ? (
                          <ChevronUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                          <User className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-foreground font-semibold">{schedule.client_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <Phone className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-muted-foreground">{schedule.client_phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30">
                          <MessageCircle className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="font-medium text-foreground">{schedule.instance_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                          <Repeat className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {getRecurrenceText(schedule)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30">
                          <Calendar className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="font-medium text-foreground">
                          {format(new Date(schedule.next_execution_date), "dd/MM/yy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(schedule.is_active)}
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {schedule.profiles && (
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-teal-100 dark:bg-teal-900/30">
                              <User className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {schedule.profiles.name}
                            </span>
                          </div>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(schedule.id, schedule.is_active)}
                          className={schedule.is_active 
                            ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/30 p-1 h-6 w-6 transition-colors duration-200"
                            : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30 p-1 h-6 w-6 transition-colors duration-200"
                          }
                          title={schedule.is_active ? "Pausar agendamento" : "Ativar agendamento"}
                        >
                          {schedule.is_active ? "⏸" : "▶"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 h-6 w-6 transition-colors duration-200"
                          title="Excluir agendamento recorrente"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Linha expandida - só renderiza se estiver expandida */}
                  {expandedRows.has(schedule.id) && (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 9 : 8} className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 p-0 border-t-2 border-purple-200 dark:border-purple-700">
                        <div className="w-full p-6 space-y-6">
                          {/* Título da seção expandida */}
                          <div className="border-b-2 border-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-700 dark:to-blue-700 pb-4">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                                <Repeat className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                              </div>
                              Informações Detalhadas do Agendamento Recorrente
                            </h3>
                          </div>

                          {/* Layout em grid para organizar as informações */}
                          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Informações de recorrência */}
                            <div className="space-y-4">
                              <h4 className="font-bold text-sm flex items-center gap-2 text-foreground">
                                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                  <Repeat className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                Configuração de Recorrência
                              </h4>
                              <div className="space-y-3">
                                <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-indigo-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                  <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">Tipo:</div>
                                  <div className="text-sm font-bold text-foreground">
                                    {getRecurrenceText(schedule)}
                                  </div>
                                </div>
                                
                                <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-blue-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">Execuções:</div>
                                  <div className="text-sm font-medium text-foreground">
                                    {schedule.executions_count} realizadas
                                  </div>
                                </div>
                                
                                {schedule.last_execution_date && (
                                  <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-green-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">Última execução:</div>
                                    <div className="text-sm font-medium text-foreground">
                                      {format(new Date(schedule.last_execution_date), "dd/MM/yyyy", { locale: ptBR })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Informações do período */}
                            <div className="space-y-4">
                              <h4 className="font-bold text-sm flex items-center gap-2 text-foreground">
                                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                Período de Execução
                              </h4>
                              <div className="space-y-3">
                                <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-orange-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                  <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2 uppercase tracking-wide">Início:</div>
                                  <div className="text-sm font-bold text-foreground">
                                    {format(new Date(schedule.start_date), "dd/MM/yyyy", { locale: ptBR })}
                                  </div>
                                </div>
                                
                                {schedule.end_date && (
                                  <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-red-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wide">Término:</div>
                                    <div className="text-sm font-medium text-foreground">
                                      {format(new Date(schedule.end_date), "dd/MM/yyyy", { locale: ptBR })}
                                    </div>
                                  </div>
                                )}

                                {schedule.total_occurrences && (
                                  <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-yellow-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-2 uppercase tracking-wide">Total de ocorrências:</div>
                                    <div className="text-sm font-medium text-foreground">
                                      {schedule.total_occurrences} execuções
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Informações do criador (só se for admin) */}
                            {isAdmin && (
                              <div className="space-y-4">
                                <h4 className="font-bold text-sm flex items-center gap-2 text-foreground">
                                  <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                                    <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                  </div>
                                  Criado por
                                </h4>
                                <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-teal-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                  {schedule.profiles ? (
                                    <>
                                      <div className="text-sm font-bold text-foreground">{schedule.profiles.name}</div>
                                      <div className="text-xs text-muted-foreground mt-1">{schedule.profiles.email}</div>
                                    </>
                                  ) : (
                                    <div className="text-sm text-muted-foreground">Informação não disponível</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Informações do cliente */}
                          <div className="space-y-4">
                            <h4 className="font-bold text-sm flex items-center gap-2 text-foreground">
                              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              Dados do Cliente
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-green-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">Nome:</div>
                                <div className="text-sm font-bold text-foreground">{schedule.client_name}</div>
                              </div>
                              <div className="p-4 bg-white dark:bg-gray-800 border-l-4 border-blue-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">Telefone:</div>
                                <div className="text-sm font-bold text-foreground">{schedule.client_phone}</div>
                              </div>
                            </div>
                          </div>

                          {/* Mensagem completa */}
                          <div className="space-y-4">
                            <h4 className="font-bold text-sm flex items-center gap-2 text-foreground">
                              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                <MessageCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              Conteúdo da Mensagem
                            </h4>
                            <div className="w-full p-6 bg-white dark:bg-gray-800 border-l-4 border-indigo-400 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                              <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">{schedule.message_text}</p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginação */}
      {schedules.length > 0 && (
        <Card className="hover:shadow-md transition-all duration-300 border-opacity-50">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Informações da paginação */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, schedules.length)} de {schedules.length} agendamentos recorrentes
                </span>
              </div>

              {/* Controles de paginação */}
              <div className="flex items-center gap-4">
                {/* Seletor de itens por página */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Itens por página:</span>
                  <Select 
                    value={itemsPerPage.toString()} 
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Botões de navegação */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 px-3"
                  >
                    Primeira
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 px-3"
                  >
                    Anterior
                  </Button>
                  
                  {/* Páginas */}
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="text-muted-foreground">...</span>
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="h-8 w-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3"
                  >
                    Próxima
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3"
                  >
                    Última
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return schedules.length === 0 ? emptyStateContent() : schedulesList();
};