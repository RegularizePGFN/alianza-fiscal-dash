import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Repeat, Clock, CheckCircle } from "lucide-react";
import { AgendamentosHeader } from "./AgendamentosHeader";
import { AgendamentosList } from "./AgendamentosList";
import { CalendarView } from "./CalendarView";
import { CreateAgendamentoModal } from "./CreateAgendamentoModal";
import { AdminInstancesModal } from "./AdminInstancesModal";
import { StatusTabs, MessageStatusFilter } from "./StatusTabs";
import { UserRole } from "@/lib/types";
import { useScheduledMessagesProcessor } from "@/hooks/agendamentos/useScheduledMessagesProcessor";
import { RecurringSchedulesList } from "./RecurringSchedulesList";
import { CreateRecurringScheduleModal } from "./CreateRecurringScheduleModal";

type TabType = 'scheduled' | 'recurring';

export const AgendamentosTabsContainer = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('scheduled');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateRecurringModal, setShowCreateRecurringModal] = useState(false);
  const [showInstancesModal, setShowInstancesModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentStatusFilter, setCurrentStatusFilter] = useState<MessageStatusFilter>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarCounts, setCalendarCounts] = useState({ scheduled: 0, sent: 0, all: 0 });

  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Hook que processa mensagens agendadas automaticamente
  useScheduledMessagesProcessor();

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateClick = () => {
    if (activeTab === 'scheduled') {
      setShowCreateModal(true);
    } else {
      setShowCreateRecurringModal(true);
    }
  };

  return (
    <div className="space-y-6">
      <AgendamentosHeader
        onCreateAgendamento={handleCreateClick}
        onManageInstances={() => setShowInstancesModal(true)}
        showManageInstances={isAdmin}
        onRefresh={handleRefresh}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isRecurring={activeTab === 'recurring'}
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-1 border border-blue-200/50 dark:border-blue-700/50">
          <TabsTrigger 
            value="scheduled" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 data-[state=active]:border data-[state=active]:border-blue-200 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:border-blue-700"
          >
            <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium">Agendamentos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="recurring" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 data-[state=active]:border data-[state=active]:border-purple-200 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:border-purple-700"
          >
            <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Repeat className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-medium">Mensagens Recorrentes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="space-y-6">
          {viewMode === 'list' ? (
            <AgendamentosList 
              refreshTrigger={refreshTrigger} 
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
                selectedInstance={null}
                statusFilter={currentStatusFilter}
                onCountsUpdate={setCalendarCounts}
              />
            </StatusTabs>
          )}
        </TabsContent>

        <TabsContent value="recurring" className="space-y-6">
          <RecurringSchedulesList 
            refreshTrigger={refreshTrigger} 
          />
        </TabsContent>
      </Tabs>

      {/* Modais */}
      <CreateAgendamentoModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleRefresh}
      />

      <CreateRecurringScheduleModal
        open={showCreateRecurringModal}
        onOpenChange={setShowCreateRecurringModal}
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