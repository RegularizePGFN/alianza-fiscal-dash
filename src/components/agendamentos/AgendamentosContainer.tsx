import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { AgendamentosHeader } from "./AgendamentosHeader";
import { AgendamentosList } from "./AgendamentosList";
import { CreateAgendamentoModal } from "./CreateAgendamentoModal";
import { AdminInstancesModal } from "./AdminInstancesModal";
import { UserRole } from "@/lib/types";
import { useScheduledMessagesProcessor } from "@/hooks/agendamentos/useScheduledMessagesProcessor";

export const AgendamentosContainer = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInstancesModal, setShowInstancesModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      />
      
      <AgendamentosList refreshTrigger={refreshTrigger} />

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