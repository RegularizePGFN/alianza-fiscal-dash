import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Power, PowerOff, Plus, X, GripVertical } from "lucide-react";
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
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface RecurringSchedulesKanbanProps {
  refreshTrigger: number;
  onEditSchedule?: (schedule: RecurringMessageSchedule) => void;
  onCreateSchedule?: (funnelStage: string) => void;
}

interface CustomFunnelStage {
  id: string;
  label: string;
  color: string;
}

const getNextColor = (existingStages: Record<string, CustomFunnelStage>): string => {
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--destructive))',
    'hsl(var(--success))',
    '#8B5CF6',
    '#06B6D4',
    '#10B981',
    '#F59E0B',
    '#EF4444'
  ];
  
  const usedColors = Object.values(existingStages).map(stage => stage.color);
  return colors.find(color => !usedColors.includes(color)) || colors[0];
};

export const RecurringSchedulesKanban = ({ 
  refreshTrigger, 
  onEditSchedule, 
  onCreateSchedule 
}: RecurringSchedulesKanbanProps) => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<RecurringMessageSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStageDialogOpen, setDeleteStageDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  const [stageToDelete, setStageToDelete] = useState<string | null>(null);
  const [newStageName, setNewStageName] = useState("");
  const [isAddingStage, setIsAddingStage] = useState(false);
  
  // State to manage custom funnel stages
  const [funnelStages, setFunnelStages] = useState<Record<string, CustomFunnelStage>>(() => {
    const defaultStages: Record<string, CustomFunnelStage> = {};
    Object.entries(FUNNEL_STAGES).forEach(([key, value]) => {
      defaultStages[key] = {
        id: key,
        label: value.label,
        color: value.color
      };
    });
    return defaultStages;
  });
  
  const [stageOrder, setStageOrder] = useState<string[]>(Object.keys(FUNNEL_STAGES));

  const isAdmin = user?.role === UserRole.ADMIN;

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      let query = supabase.from('recurring_message_schedules').select(`*`);

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

  const updateScheduleStage = async (scheduleId: string, newStage: string) => {
    try {
      const { error } = await supabase
        .from('recurring_message_schedules')
        .update({ funnel_stage: newStage } as any)
        .eq('id', scheduleId);

      if (error) throw error;
      
      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule stage:', error);
      toast({
        title: "Erro",
        description: "Erro ao mover agendamento",
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

  const handleDeleteStage = async () => {
    if (!stageToDelete) return;

    try {
      // First, delete all schedules in this stage
      const schedulesToDelete = schedules.filter(s => s.funnel_stage === stageToDelete);
      
      if (schedulesToDelete.length > 0) {
        const { error: deleteSchedulesError } = await supabase
          .from('recurring_message_schedules')
          .delete()
          .eq('funnel_stage', stageToDelete as any);

        if (deleteSchedulesError) throw deleteSchedulesError;
      }

      // Remove stage from local state
      const newStages = { ...funnelStages };
      delete newStages[stageToDelete];
      setFunnelStages(newStages);
      
      const newOrder = stageOrder.filter(id => id !== stageToDelete);
      setStageOrder(newOrder);

      toast({
        title: "Sucesso",
        description: `Etapa excluída junto com ${schedulesToDelete.length} agendamento(s)`,
      });

      fetchSchedules();
      setDeleteStageDialogOpen(false);
      setStageToDelete(null);
    } catch (error) {
      console.error('Error deleting stage:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir etapa",
        variant: "destructive",
      });
    }
  };

  const addNewStage = () => {
    if (!newStageName.trim()) return;

    const stageId = newStageName.toLowerCase().replace(/\s+/g, '_');
    
    if (funnelStages[stageId]) {
      toast({
        title: "Erro",
        description: "Uma etapa com este nome já existe",
        variant: "destructive",
      });
      return;
    }

    const newStage: CustomFunnelStage = {
      id: stageId,
      label: newStageName.trim(),
      color: getNextColor(funnelStages)
    };

    setFunnelStages(prev => ({ ...prev, [stageId]: newStage }));
    setStageOrder(prev => [...prev, stageId]);
    setNewStageName("");
    setIsAddingStage(false);

    toast({
      title: "Sucesso", 
      description: "Nova etapa adicionada com sucesso",
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'STAGE') {
      // Reordering stages/columns
      const newOrder = Array.from(stageOrder);
      const [removed] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, removed);
      setStageOrder(newOrder);
      return;
    }

    if (type === 'SCHEDULE') {
      // Moving schedules between stages
      const sourceStageId = source.droppableId;
      const destStageId = destination.droppableId;
      
      if (sourceStageId === destStageId) {
        // Same column, just reordering - we don't need to persist order for now
        return;
      }

      // Different columns, update the schedule's funnel_stage
      const draggedScheduleId = result.draggableId;
      updateScheduleStage(draggedScheduleId, destStageId);
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

  const schedulesByStage = stageOrder.reduce((acc, stageId) => {
    acc[stageId] = schedules.filter(schedule => schedule.funnel_stage === stageId);
    return acc;
  }, {} as Record<string, RecurringMessageSchedule[]>);

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="stages" direction="horizontal" type="STAGE">
          {(provided) => (
            <div 
              ref={provided.innerRef} 
              {...provided.droppableProps}
              className="flex gap-4 overflow-x-auto pb-4"
            >
              {stageOrder.map((stageId, index) => {
                const stage = funnelStages[stageId];
                if (!stage) return null;
                
                return (
                  <Draggable key={stageId} draggableId={stageId} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex-shrink-0 w-80"
                      >
                        <Card className={`h-full ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                              <div 
                                {...provided.dragHandleProps}
                                className="cursor-move"
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: stage.color }}
                              />
                              {stage.label}
                              <Badge variant="secondary" className="ml-auto">
                                {schedulesByStage[stageId]?.length || 0}
                              </Badge>
                              
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => onCreateSchedule?.(stageId)}
                                  title="Adicionar agendamento nesta etapa"
                                >
                                  <Plus className="h-3 w-3 text-green-600" />
                                </Button>
                                
                                {!Object.keys(FUNNEL_STAGES).includes(stageId) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      setStageToDelete(stageId);
                                      setDeleteStageDialogOpen(true);
                                    }}
                                    title="Excluir etapa"
                                  >
                                    <X className="h-3 w-3 text-red-600" />
                                  </Button>
                                )}
                              </div>
                            </CardTitle>
                          </CardHeader>
                          
                          <Droppable droppableId={stageId} type="SCHEDULE">
                            {(provided, snapshot) => (
                              <CardContent 
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`space-y-3 max-h-96 overflow-y-auto ${
                                  snapshot.isDraggingOver ? 'bg-muted/50' : ''
                                }`}
                              >
                                {schedulesByStage[stageId]?.map((schedule, index) => (
                                  <Draggable 
                                    key={schedule.id} 
                                    draggableId={schedule.id} 
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <Card 
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`p-3 border-l-4 bg-muted/30 cursor-move ${
                                          snapshot.isDragging ? 'shadow-lg rotate-1 z-50' : ''
                                        }`}
                                        style={{ 
                                          borderLeftColor: stage.color,
                                          ...provided.draggableProps.style 
                                        }}
                                      >
                                        <div className="space-y-2">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                              <h4 className="font-medium text-sm truncate">
                                                {schedule.client_name}
                                              </h4>
                                              <p className="text-xs text-muted-foreground truncate">
                                                {schedule.client_phone}
                                              </p>
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
                                    )}
                                  </Draggable>
                                ))}
                                
                                {provided.placeholder}
                                
                                {!schedulesByStage[stageId]?.length && (
                                  <div className="text-center py-8 text-xs text-muted-foreground">
                                    Nenhum agendamento nesta etapa
                                  </div>
                                )}
                              </CardContent>
                            )}
                          </Droppable>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              
              {provided.placeholder}
              
              {/* Add New Stage Card */}
              <div className="flex-shrink-0 w-80">
                <Card className="h-full border-dashed border-2">
                  <CardContent className="flex items-center justify-center h-full p-6">
                    {isAddingStage ? (
                      <div className="space-y-3 w-full">
                        <Input
                          placeholder="Nome da nova etapa"
                          value={newStageName}
                          onChange={(e) => setNewStageName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addNewStage();
                            if (e.key === 'Escape') {
                              setIsAddingStage(false);
                              setNewStageName("");
                            }
                          }}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={addNewStage}>
                            Adicionar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setIsAddingStage(false);
                              setNewStageName("");
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        className="w-full h-full text-muted-foreground hover:text-primary"
                        onClick={() => setIsAddingStage(true)}
                      >
                        <Plus className="h-6 w-6 mr-2" />
                        Adicionar Nova Etapa
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Delete Schedule Dialog */}
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

      {/* Delete Stage Dialog */}
      <AlertDialog open={deleteStageDialogOpen} onOpenChange={setDeleteStageDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão da etapa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta etapa? Todos os agendamentos dentro desta etapa serão excluídos permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteStage}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir Etapa e Agendamentos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};