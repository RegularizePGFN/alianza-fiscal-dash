import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { AgendamentosHeader } from "./AgendamentosHeader";
import { AgendamentosListWithDashboard } from "./AgendamentosListWithDashboard";
import { CalendarView } from "./CalendarView";
import { CreateAgendamentoModal } from "./CreateAgendamentoModal";
import { AdminInstancesModal } from "./AdminInstancesModal";
import { RecurringSchedulesKanban } from "./RecurringSchedulesKanban";
import { CreateRecurringScheduleModal } from "./CreateRecurringScheduleModal";
import { Button } from "@/components/ui/button";
import { Repeat, Plus, Clock } from "lucide-react";

import { StatusTabs, MessageStatusFilter } from "./StatusTabs";
import { UserRole } from "@/lib/types";
import { useScheduledMessagesProcessor } from "@/hooks/agendamentos/useScheduledMessagesProcessor";
import { useRecurringMessagesProcessor } from "@/hooks/agendamentos/useRecurringMessagesProcessor";

export const AgendamentosContainer = () => {
  const { user } = useAuth();
  const [agendamentoType, setAgendamentoType] = useState<'conventional' | 'recurring'>('conventional');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateRecurringModal, setShowCreateRecurringModal] = useState(false);
  const [showInstancesModal, setShowInstancesModal] = useState(false);
  const [createScheduleModalOpen, setCreateScheduleModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [preSelectedFunnelStage, setPreSelectedFunnelStage] = useState<string | null>(null);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [currentStatusFilter, setCurrentStatusFilter] = useState<MessageStatusFilter>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarCounts, setCalendarCounts] = useState({ scheduled: 0, sent: 0, all: 0 });

  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Hook que processa mensagens agendadas automaticamente
  useScheduledMessagesProcessor();
  
  // Hook que processa agendamentos recorrentes automaticamente
  useRecurringMessagesProcessor();

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditSchedule = (schedule: any) => {
    setEditingSchedule(schedule);
    setCreateScheduleModalOpen(true);
  };

  const handleModalClose = () => {
    setCreateScheduleModalOpen(false);
    setEditingSchedule(null);
    setPreSelectedFunnelStage(null);
  };

  const handleCreateSchedule = (funnelStage: string) => {
    setPreSelectedFunnelStage(funnelStage);
    setCreateScheduleModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header com seletores de tipo */}
      <div className="flex justify-start items-center">
        <div className="flex items-center gap-2">
          <Button
            variant={agendamentoType === 'conventional' ? 'default' : 'outline'}
            onClick={() => setAgendamentoType('conventional')}
            className="flex items-center gap-2 h-8 px-4"
            size="sm"
          >
            <Clock className="h-3 w-3" />
            Convencional
          </Button>
          
          <Button
            variant={agendamentoType === 'recurring' ? 'default' : 'outline'}
            onClick={() => setAgendamentoType('recurring')}
            className="flex items-center gap-2 h-8 px-4"
            size="sm"
          >
            <Repeat className="h-3 w-3" />
            Recorrente
          </Button>
        </div>
      </div>

      {agendamentoType === 'conventional' ? (
        <>
          <AgendamentosHeader
            onCreateAgendamento={() => setShowCreateModal(true)}
            onManageInstances={() => setShowInstancesModal(true)}
            showManageInstances={isAdmin}
            onRefresh={handleRefresh}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {viewMode === 'list' ? (
            <AgendamentosListWithDashboard 
              refreshTrigger={refreshTrigger}
              selectedInstance={selectedInstance}
              statusFilter={currentStatusFilter}
              onStatusChange={setCurrentStatusFilter}
            />
          ) : (
            <StatusTabs
              currentStatus={currentStatusFilter}
              onStatusChange={setCurrentStatusFilter}
              counts={calendarCounts}
            >
              <CalendarView
                refreshTrigger={refreshTrigger}
                selectedInstance={selectedInstance}
                statusFilter={currentStatusFilter}
                onCountsUpdate={setCalendarCounts}
              />
            </StatusTabs>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">Agendamentos Recorrentes</h2>
              <p className="text-muted-foreground">Gerencie mensagens recorrentes por etapa do funil</p>
            </div>
            <div className="flex gap-2">
              {/* Apenas admins podem criar novos funis */}
              {isAdmin && (
                <Button
                  onClick={() => setIsAddingStage(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Novo Funil
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setShowInstancesModal(true)}
                >
                  Gerenciar Instâncias
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleRefresh}
              >
                Atualizar
              </Button>
            </div>
          </div>
          
          <RecurringSchedulesKanban 
            refreshTrigger={refreshTrigger}
            onEditSchedule={handleEditSchedule}
            onCreateSchedule={handleCreateSchedule}
            isAddingStage={isAddingStage}
            onAddingStageChange={setIsAddingStage}
          />
        </>
      )}

      <CreateAgendamentoModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleRefresh}
      />

      <CreateRecurringScheduleModal
        open={createScheduleModalOpen}
        onOpenChange={handleModalClose}
        onSuccess={() => {
          handleRefresh();
          handleModalClose();
        }}
        editingSchedule={editingSchedule}
        preSelectedFunnelStage={preSelectedFunnelStage}
      />

      {isAdmin && (
        <AdminInstancesModal
          open={showInstancesModal}
          onOpenChange={setShowInstancesModal}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};