import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Power, PowerOff, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { 
  RecurringMessageSchedule, 
  FunnelStage, 
  FUNNEL_STAGES,
  RECURRENCE_TYPE_LABELS 
} from "@/lib/types/recurringSchedules";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RecurringSchedulesKanbanProps {
  refreshTrigger: number;
  onEditSchedule?: (schedule: RecurringMessageSchedule) => void;
}

export const RecurringSchedulesKanban = ({ refreshTrigger, onEditSchedule }: RecurringSchedulesKanbanProps) => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<RecurringMessageSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      let query = supabase.from('recurring_message_schedules').select(`
        *
      `);

      if (!isAdmin) {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching recurring schedules:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar agendamentos recorrentes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleScheduleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('recurring_message_schedules')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Agendamento ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`,
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error toggling schedule status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do agendamento",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return;

    try {
      const { error } = await supabase
        .from('recurring_message_schedules')
        .delete()
        .eq('id', scheduleToDelete);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso",
      });

      fetchSchedules();
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir agendamento",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSchedules();
    }
  }, [user?.id, refreshTrigger]);

  if (loading) {
    return <div className="text-center py-8">Carregando agendamentos...</div>;
  }

  const schedulesByStage = Object.keys(FUNNEL_STAGES).reduce((acc, stage) => {
    acc[stage as FunnelStage] = schedules.filter(
      schedule => schedule.funnel_stage === stage
    );
    return acc;
  }, {} as Record<FunnelStage, RecurringMessageSchedule[]>);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Object.entries(FUNNEL_STAGES).map(([stage, config]) => (
          <div key={stage} className="flex-shrink-0 w-80">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle 
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: config.color }}
                  />
                  {config.label}
                  <Badge variant="secondary" className="ml-auto">
                    {schedulesByStage[stage as FunnelStage]?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {schedulesByStage[stage as FunnelStage]?.map((schedule) => (
                  <Card key={schedule.id} className="p-3 border-l-4 bg-muted/30" style={{ borderLeftColor: config.color }}>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{schedule.client_name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{schedule.client_phone}</p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => onEditSchedule?.(schedule)}
                            title="Editar agendamento"
                          >
                            <Edit className="h-3 w-3 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleScheduleStatus(schedule.id, schedule.is_active)}
                            title={schedule.is_active ? "Desativar" : "Ativar"}
                          >
                            {schedule.is_active ? (
                              <Power className="h-3 w-3 text-green-600" />
                            ) : (
                              <PowerOff className="h-3 w-3 text-red-600" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setScheduleToDelete(schedule.id);
                              setDeleteDialogOpen(true);
                            }}
                            title="Excluir agendamento"
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant={schedule.is_active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {RECURRENCE_TYPE_LABELS[schedule.recurrence_type]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {schedule.execution_time}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                          {schedule.message_text}
                        </p>
                        
                        <div className="text-xs text-muted-foreground truncate">
                          <strong>Instância:</strong> {schedule.instance_name}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {!schedulesByStage[stage as FunnelStage]?.length && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    Nenhum agendamento nesta etapa
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento recorrente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSchedule}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};