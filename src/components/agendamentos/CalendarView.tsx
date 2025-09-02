import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/lib/types";

interface CalendarViewProps {
  refreshTrigger: number;
  selectedInstance: string | null;
  statusFilter: string;
}

export const CalendarView = ({ refreshTrigger, selectedInstance, statusFilter }: CalendarViewProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

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
      
      const { data, error } = await supabase
        .from('scheduled_messages')
        .select('*, user_profiles(full_name)')
        .order('scheduled_date', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        return;
      }

      let filteredMessages = data || [];

      // Apply filters in JavaScript instead of SQL to avoid type issues
      if (!isAdmin && user?.id) {
        filteredMessages = filteredMessages.filter(msg => msg.user_id === user.id);
      }

      // Note: instance filtering removed due to schema mismatch
      // if (selectedInstance) {
      //   filteredMessages = filteredMessages.filter(msg => msg.instance_id === selectedInstance);
      // }

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
  }, [refreshTrigger, selectedInstance, statusFilter]);

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
        return <Badge variant="default" className="text-xs">Enviada</Badge>;
      case 'pending':
      case 'scheduled':
        return <Badge variant="outline" className="text-xs">Agendada</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs">Falhou</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando agenda...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateWeek('prev')}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Semana Anterior
        </Button>
        
        <h3 className="text-lg font-semibold">
          {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </h3>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateWeek('next')}
          className="flex items-center gap-2"
        >
          Próxima Semana
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-8 border-b">
          {/* Time column header */}
          <div className="p-3 border-r bg-muted/50 font-medium text-sm">
            Horário
          </div>
          
          {/* Day headers */}
          {weekDays.map((day, index) => (
            <div key={index} className="p-3 border-r last:border-r-0 bg-muted/50 text-center">
              <div className="font-medium text-sm">
                {format(day, 'EEE', { locale: ptBR }).toUpperCase()}
              </div>
              <div className="text-lg font-bold mt-1">
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots and events */}
        <div className="max-h-96 overflow-y-auto">
          {timeSlots.map((time, timeIndex) => (
            <div key={time} className="grid grid-cols-8 border-b last:border-b-0 min-h-[60px]">
              {/* Time label */}
              <div className="p-2 border-r bg-muted/30 text-sm font-medium flex items-start justify-center pt-3">
                {time}
              </div>
              
              {/* Day cells */}
              {weekDays.map((day, dayIndex) => {
                const dayMessages = getMessagesForTimeSlot(day, time);
                
                return (
                  <div key={dayIndex} className="p-1 border-r last:border-r-0 relative">
                    {dayMessages.map((message) => (
                      <div
                        key={message.id}
                        className="bg-primary/10 border border-primary/20 rounded-md p-2 mb-1 text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                        title={`${message.client_name} - ${message.message_text.substring(0, 50)}...`}
                      >
                        <div className="font-medium text-primary truncate">
                          {message.client_name}
                        </div>
                        <div className="text-muted-foreground truncate mt-1">
                          {message.client_phone}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          {getStatusBadge(message.status)}
                          {isAdmin && message.user_profiles && (
                            <span className="text-xs text-muted-foreground">
                              {message.user_profiles.full_name?.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};