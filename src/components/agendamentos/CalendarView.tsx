import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, addDays, isSameDay, parseISO, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, User, MessageCircle, Calendar, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/types";

interface CalendarViewProps {
  refreshTrigger: number;
  selectedInstance: string | null;
  statusFilter: string;
  onCountsUpdate?: (counts: { scheduled: number; sent: number; all: number }) => void;
}

export const CalendarView = ({ refreshTrigger, selectedInstance, statusFilter, onCountsUpdate }: CalendarViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    scheduled_date: '',
    message_text: ''
  });

  const isAdmin = user?.role === UserRole.ADMIN;

  // Generate time slots (8 AM to 10 PM)
  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Get week days starting from Sunday
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // First, get ALL messages for counting purposes
      let allDataQuery = supabase
        .from('scheduled_messages')
        .select('*');
      
      // Apply user filter for non-admin users
      if (!isAdmin && user?.id) {
        allDataQuery = allDataQuery.eq('user_id', user.id);
      }
      
      const { data: allData, error: allError } = await allDataQuery;
      
      if (allError) {
        console.error('Supabase error:', allError);
        return;
      }
      
      // Calculate and update counts for all messages
      if (onCountsUpdate && allData) {
        const counts = {
          all: allData.length,
          scheduled: allData.filter(msg => ['pending', 'scheduled'].includes(msg.status)).length,
          sent: allData.filter(msg => msg.status === 'sent').length
        };
        onCountsUpdate(counts);
      }
      
      // Now get data for the current week view
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
      const weekEnd = endOfDay(addDays(weekStart, 6));
      
      const { data: weekData, error: weekError } = await supabase
        .from('scheduled_messages')
        .select('*')
        .gte('scheduled_date', weekStart.toISOString())
        .lte('scheduled_date', weekEnd.toISOString())
        .order('scheduled_date', { ascending: true });

      if (weekError) {
        console.error('Supabase error:', weekError);
        return;
      }

      let filteredMessages = weekData || [];

      // Apply filters for display
      if (!isAdmin && user?.id) {
        filteredMessages = filteredMessages.filter(msg => msg.user_id === user.id);
      }

      if (statusFilter === 'scheduled') {
        filteredMessages = filteredMessages.filter(msg => ['pending', 'scheduled'].includes(msg.status));
      } else if (statusFilter === 'sent') {
        filteredMessages = filteredMessages.filter(msg => msg.status === 'sent');
      }

      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [refreshTrigger, selectedInstance, statusFilter, currentWeek]);

  const getMessagesForTimeSlot = (day: Date, time: string) => {
    return messages.filter(message => {
      const messageDate = parseISO(message.scheduled_date);
      const messageTime = format(messageDate, 'HH:00');
      return isSameDay(messageDate, day) && messageTime === time;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">✓ Enviada</Badge>;
      case 'pending':
      case 'scheduled':
        return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">⏱ Agendada</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs bg-red-100 text-red-800 border-red-200">✗ Falhou</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  const getEventColor = (status: string, scheduledDate: string) => {
    const now = new Date();
    const eventDate = parseISO(scheduledDate);
    
    if (status === 'sent') {
      return 'bg-gradient-to-r from-green-100 to-green-200 border-green-300 hover:from-green-200 hover:to-green-300';
    } else if (status === 'failed') {
      return 'bg-gradient-to-r from-red-100 to-red-200 border-red-300 hover:from-red-200 hover:to-red-300';
    } else if (isBefore(eventDate, now)) {
      return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300 hover:from-gray-200 hover:to-gray-300';
    } else {
      return 'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300 hover:from-blue-200 hover:to-blue-300';
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const handleEditClick = (message: any) => {
    setSelectedMessage(message);
    setEditForm({
      scheduled_date: format(parseISO(message.scheduled_date), "yyyy-MM-dd'T'HH:mm"),
      message_text: message.message_text
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMessage || !editForm.scheduled_date || !editForm.message_text.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('scheduled_messages')
        .update({
          scheduled_date: new Date(editForm.scheduled_date).toISOString(),
          message_text: editForm.message_text.trim()
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso!",
      });

      setIsEditModalOpen(false);
      setSelectedMessage(null);
      fetchMessages(); // Recarregar os dados
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      const { error } = await supabase
        .from('scheduled_messages')
        .delete()
        .eq('id', selectedMessage.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso!",
      });

      setIsEditModalOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedMessage(null);
      fetchMessages(); // Recarregar os dados
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {/* Loading skeleton for navigation */}
        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200/60">
          <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        
        {/* Loading skeleton for calendar */}
        <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
          <div className="grid grid-cols-8 border-b border-gray-200/60">
            <div className="p-4 border-r border-gray-200/60 bg-gray-100 h-16"></div>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="p-4 border-r last:border-r-0 border-gray-200/60 bg-gray-50 h-16 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-3 text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-lg font-medium">Carregando agenda...</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Buscando seus agendamentos</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-gradient-to-r from-white to-gray-50 p-4 rounded-lg border border-gray-200/60 shadow-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateWeek('prev')}
          className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 hover:scale-105"
        >
          <ChevronLeft className="h-4 w-4" />
          Semana Anterior
        </Button>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentWeek(new Date())}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Hoje
          </Button>
          
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {messages.length} agendamento{messages.length !== 1 ? 's' : ''} nesta semana
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateWeek('next')}
          className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 hover:scale-105"
        >
          Próxima Semana
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
        <div className="w-full" style={{ display: 'grid', gridTemplateColumns: '120px repeat(7, 1fr)' }}>
          {/* Time column header */}
          <div className="border-r border-b border-gray-200/60 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-sm text-gray-600 flex items-center justify-center min-h-[80px]">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário
            </div>
          </div>
          
          {/* Day headers */}
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={index} className={`border-r last:border-r-0 border-b border-gray-200/60 text-center transition-colors min-h-[80px] flex flex-col items-center justify-center ${
                isToday 
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900' 
                  : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150'
              }`}>
                <div className="font-semibold text-xs uppercase tracking-wide">
                  {format(day, 'EEEE', { locale: ptBR })}
                </div>
                <div className={`text-xl font-bold mt-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </div>
                {isToday && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time slots and events */}
        <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {messages.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 border-2 border-dashed border-gray-300">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhum agendamento nesta semana
                </h3>
                <p className="text-sm text-gray-500">
                  Não há mensagens agendadas para o período selecionado.
                </p>
              </div>
            </div>
          ) : (
            timeSlots.map((time, timeIndex) => (
              <div key={time} className="w-full border-b last:border-b-0 border-gray-100/80 min-h-[70px] hover:bg-gray-50/30 transition-colors" style={{ display: 'grid', gridTemplateColumns: '120px repeat(7, 1fr)' }}>
                {/* Time label */}
                <div className="border-r border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white text-sm font-semibold text-gray-600 flex items-center justify-center">
                  <span className="bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200/80">
                    {time}
                  </span>
                </div>
                
                {/* Day cells */}
                {weekDays.map((day, dayIndex) => {
                  const dayMessages = getMessagesForTimeSlot(day, time);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div key={dayIndex} className={`p-4 border-r last:border-r-0 border-gray-200/60 relative transition-colors ${
                      isToday ? 'bg-blue-50/30' : ''
                    }`}>
                      {dayMessages.map((message) => (
                        <div
                          key={message.id}
                          onClick={() => handleEditClick(message)}
                          className={`${getEventColor(message.status, message.scheduled_date)} 
                            border rounded-lg p-2 mb-2 text-xs cursor-pointer 
                            transition-all duration-200 hover:scale-[1.02] hover:shadow-md
                            animate-fade-in backdrop-blur-sm hover-lift`}
                          title="Clique para editar este agendamento"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1 flex-1">
                              <User className="h-3 w-3 text-gray-600 flex-shrink-0" />
                              <span className="font-semibold text-gray-800 truncate text-xs">
                                {message.instance_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-500 flex-shrink-0" />
                              <span className="text-xs text-gray-600 font-medium">
                                {format(parseISO(message.scheduled_date), 'HH:mm')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 mb-2">
                            <MessageCircle className="h-3 w-3 text-gray-600 flex-shrink-0" />
                            <span className="text-xs text-gray-600 truncate">
                              {message.client_phone}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-start">
                            {getStatusBadge(message.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </Card>
      
      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Editar Agendamento
            </DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Cliente:</p>
                <p className="font-semibold">{selectedMessage.client_name || 'Sem nome'}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedMessage.client_phone}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Data e Horário</Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  value={editForm.scheduled_date}
                  onChange={(e) => setEditForm(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message_text">Mensagem</Label>
                <Textarea
                  id="message_text"
                  value={editForm.message_text}
                  onChange={(e) => setEditForm(prev => ({ ...prev, message_text: e.target.value }))}
                  placeholder="Digite a mensagem..."
                  rows={4}
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que gostaria de apagar este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir Agendamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};