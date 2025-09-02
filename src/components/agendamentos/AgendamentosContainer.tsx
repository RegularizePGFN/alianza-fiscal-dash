import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { AgendamentosHeader } from "./AgendamentosHeader";
import { AgendamentosList } from "./AgendamentosList";
import { CalendarView } from "./CalendarView";
import { CreateAgendamentoModal } from "./CreateAgendamentoModal";
import { AdminInstancesModal } from "./AdminInstancesModal";
import { InstanceFilter } from "./InstanceFilter";
import { StatusTabs, MessageStatusFilter } from "./StatusTabs";
import { UserRole } from "@/lib/types";
import { useScheduledMessagesProcessor } from "@/hooks/agendamentos/useScheduledMessagesProcessor";

export const AgendamentosContainer = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInstancesModal, setShowInstancesModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [currentStatusFilter, setCurrentStatusFilter] = useState<MessageStatusFilter>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Hook que processa mensagens agendadas automaticamente
  useScheduledMessagesProcessor();

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <AgendamentosHeader
        onCreateAgendamento={() => setShowCreateModal(true)}
        onManageInstances={() => setShowInstancesModal(true)}
        showManageInstances={isAdmin}
        onRefresh={handleRefresh}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      {isAdmin && (
        <InstanceFilter
          selectedInstance={selectedInstance}
          onInstanceSelect={setSelectedInstance}
          refreshTrigger={refreshTrigger}
        />
      )}
      
      {viewMode === 'list' ? (
        <AgendamentosList 
          refreshTrigger={refreshTrigger} 
          selectedInstance={selectedInstance}
          statusFilter={currentStatusFilter}
          onStatusChange={setCurrentStatusFilter}
        />
      ) : (
        <CalendarView
          refreshTrigger={refreshTrigger}
          selectedInstance={selectedInstance}
          statusFilter={currentStatusFilter}
        />
      )}

      <CreateAgendamentoModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleRefresh}
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