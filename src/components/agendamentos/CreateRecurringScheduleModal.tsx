import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/types";

interface CreateRecurringScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface UserInstance {
  id: string;
  instance_name: string;
}

export const CreateRecurringScheduleModal = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateRecurringScheduleModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<UserInstance[]>([]);

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedInstance, setSelectedInstance] = useState("");
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [totalOccurrences, setTotalOccurrences] = useState<number>();
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [endType, setEndType] = useState<'date' | 'occurrences'>('date');

  const isAdmin = user?.role === UserRole.ADMIN;

  // Fetch user instances
  useEffect(() => {
    const fetchInstances = async () => {
      if (!user) return;

      try {
        let query = supabase
          .from('user_whatsapp_instances')
          .select('id, instance_name')
          .eq('is_active', true);

        if (!isAdmin) {
          // Para não-admins, buscar instâncias através da tabela de acesso
          const { data: accessData } = await supabase
            .from('user_instance_access')
            .select(`
              instance_id,
              user_whatsapp_instances!inner(id, instance_name)
            `)
            .eq('user_id', user.id);

          if (accessData) {
            const userInstances = accessData.map(access => ({
              id: access.user_whatsapp_instances.id,
              instance_name: access.user_whatsapp_instances.instance_name
            }));
            setInstances(userInstances);
          }
          return;
        }

        const { data, error } = await query;
        if (error) throw error;
        setInstances(data || []);
      } catch (error) {
        console.error('Error fetching instances:', error);
      }
    };

    if (open) {
      fetchInstances();
    }
  }, [user, open, isAdmin]);

  const calculateNextExecutionDate = (startDate: Date, recurrenceType: string, interval: number, dayOfMonth?: number, dayOfWeek?: number): Date => {
    const nextDate = new Date(startDate);
    
    switch (recurrenceType) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case 'weekly':
        const currentDay = nextDate.getDay();
        const targetDay = dayOfWeek || 1;
        const daysUntilTarget = (targetDay - currentDay + 7) % 7;
        nextDate.setDate(nextDate.getDate() + (daysUntilTarget === 0 ? 7 * interval : daysUntilTarget));
        break;
      case 'monthly':
        const targetDayOfMonth = dayOfMonth || 1;
        nextDate.setMonth(nextDate.getMonth() + interval);
        nextDate.setDate(Math.min(targetDayOfMonth, new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()));
        break;
    }
    
    return nextDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !startDate) return;

    setLoading(true);

    try {
      const nextExecutionDate = calculateNextExecutionDate(
        startDate,
        recurrenceType,
        recurrenceInterval,
        dayOfMonth,
        dayOfWeek
      );

      const scheduleData = {
        user_id: user.id,
        client_name: clientName,
        client_phone: clientPhone,
        message_text: messageText,
        instance_name: selectedInstance,
        recurrence_type: recurrenceType,
        recurrence_interval: recurrenceInterval,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: endType === 'date' && endDate ? format(endDate, 'yyyy-MM-dd') : null,
        total_occurrences: endType === 'occurrences' ? totalOccurrences : null,
        day_of_month: recurrenceType === 'monthly' ? dayOfMonth : null,
        day_of_week: recurrenceType === 'weekly' ? dayOfWeek : null,
        next_execution_date: format(nextExecutionDate, 'yyyy-MM-dd'),
        is_active: true,
        executions_count: 0
      };

      const { error } = await supabase
        .from('recurring_schedules')
        .insert([scheduleData]);

      if (error) throw error;

      toast({
        title: "Agendamento recorrente criado",
        description: "O agendamento recorrente foi criado com sucesso e será processado automaticamente.",
      });

      // Reset form
      setClientName("");
      setClientPhone("");
      setMessageText("");
      setSelectedInstance("");
      setRecurrenceType('monthly');
      setRecurrenceInterval(1);
      setStartDate(undefined);
      setEndDate(undefined);
      setTotalOccurrences(undefined);
      setDayOfMonth(1);
      setDayOfWeek(1);
      setEndType('date');

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating recurring schedule:', error);
      toast({
        title: "Erro ao criar agendamento recorrente",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dayNames = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Repeat className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            Novo Agendamento Recorrente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome completo do cliente"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Telefone</Label>
              <Input
                id="clientPhone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="5511999999999"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instance">Instância WhatsApp</Label>
            <Select value={selectedInstance} onValueChange={setSelectedInstance} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma instância" />
              </SelectTrigger>
              <SelectContent>
                {instances.map((instance) => (
                  <SelectItem key={instance.id} value={instance.instance_name}>
                    {instance.instance_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Digite a mensagem que será enviada..."
              rows={4}
              required
            />
          </div>

          {/* Configurações de Recorrência */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <h4 className="font-semibold text-sm">Configurações de Recorrência</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Recorrência</Label>
                <Select value={recurrenceType} onValueChange={(value: any) => setRecurrenceType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Intervalo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    {recurrenceType === 'daily' && `dia${recurrenceInterval > 1 ? 's' : ''}`}
                    {recurrenceType === 'weekly' && `semana${recurrenceInterval > 1 ? 's' : ''}`}
                    {recurrenceType === 'monthly' && `mês${recurrenceInterval > 1 ? 'es' : ''}`}
                  </span>
                </div>
              </div>
            </div>

            {recurrenceType === 'weekly' && (
              <div className="space-y-2">
                <Label>Dia da Semana</Label>
                <Select value={dayOfWeek.toString()} onValueChange={(value) => setDayOfWeek(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dayNames.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {recurrenceType === 'monthly' && (
              <div className="space-y-2">
                <Label>Dia do Mês</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            )}
          </div>

          {/* Período */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <h4 className="font-semibold text-sm">Período de Execução</h4>
            
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-4">
              <Label>Término</Label>
              <Select value={endType} onValueChange={(value: any) => setEndType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Por data</SelectItem>
                  <SelectItem value="occurrences">Por número de execuções</SelectItem>
                </SelectContent>
              </Select>

              {endType === 'date' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data final"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      locale={ptBR}
                      disabled={(date) => startDate ? date <= startDate : false}
                    />
                  </PopoverContent>
                </Popover>
              )}

              {endType === 'occurrences' && (
                <div className="space-y-2">
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={totalOccurrences || ''}
                    onChange={(e) => setTotalOccurrences(Number(e.target.value))}
                    placeholder="Número de execuções"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Agendamento Recorrente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};